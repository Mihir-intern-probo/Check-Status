import sys
import time
from subprocess import call
import datetime
import time
from mysqlConnection import connection
import requests
import os
from dotenv import load_dotenv
import json 
from sqlalchemy import text
import traceback
import asyncio
import aiohttp
load_dotenv()
import redis
redis_host='3.110.253.71'
redis_port=6379

r = redis.StrictRedis(
    host=redis_host,
    port=redis_port,
    decode_responses=True)

async def main():
    print("Checking Orders", datetime.datetime.now())
    test1 = connection.execute(text(f'select * from active_orders_placeds where status="PENDING"; '))
    response = test1.fetchall()
    async with aiohttp.ClientSession() as session:
        tasks = []
        cancel_tasks = []
        for x in response:
            if((datetime.datetime.now()-x[9]).total_seconds()<=5):
                if(x[6]=="BUY"):
                    load = {"exit_params": [{"exit_price": x[4]+0.5, "exit_type": "LO", "order_id": x[3]}]}
                    task = asyncio.create_task(session.put(os.getenv('EXIT_API'), headers = {'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"}, json = load))
                    tasks.append(task)
                else:
                    load = {"exit_params": [{"exit_price": x[4]+0.5, "exit_type": "LO", "order_id": x[3]}]}
                    task = asyncio.create_task(session.put(os.getenv('EXIT_API'), headers = {'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"}, json = load))
                    tasks.append(task)
            else:
                cancel_task = asyncio.create_task(session.put(os.getenv('CANCEL_API')+f'{x[3]}?eventId={x[2]}', headers={'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"}))
                cancel_tasks.append(cancel_task)
        result = await asyncio.gather(*tasks)
        cancel_result = await asyncio.gather(*cancel_tasks)
        for i in range(len(result)):
            res = json.loads(await result[i].text())
            print("EXIT PLACED", response[i][3])
            if(res['isError']==False):
                sql = f'update active_orders_placeds set `status` = "EXIT_PLACED", `updatedAt`= "{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}" where transactionId={response[i][1]}'
                test1 = connection.execute(text(sql))
                connection.commit()
            else:
                print(response[i][3], res)
        print("cancel requests",len(cancel_result))
        for i in range(len(cancel_result)):
            res = json.loads(await cancel_result[i].text())
            print("CANCEL PLACED", response[i][3])
            if(res["isError"]==False):
                print("CANCEL SUCCESSFUL", response[i][3])
                sql=f'insert into trades_placeds (transactionId, order_id, eventId, entry_price, exit_price, offer_type, order_type, profit, status, createdAt, updatedAt, tradePlacedAt) values ({response[i][1]}, {response[i][3]}, {response[i][2]}, {response[i][4]}, {response[i][4]}, "LO", "{response[i][6]}", {0},"CANCELED" , "{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{str(response[i][8])}")'
                test1 = connection.execute(text(sql))
                connection.commit()
                sql = f'delete from active_orders_placeds where transactionId={response[i][1]}'
                test1 = connection.execute(text(sql))
                connection.commit()
            else:
                print(response[i][3], "CANCEL FAILED")
    await session.close()
    test1 = connection.execute(text(f'select * from active_orders_placeds where status="EXIT_SUCCESSFULLY"; '))
    response = test1.fetchall()   
    async with aiohttp.ClientSession() as session:
        tasks = []
        cancel_and_exit_tasks = []
        for x in response:
            if((datetime.datetime.now()-x[9]).total_seconds()>=5):
                if(x[6]=="BUY"):
                    load = {"exit_price": float(r.get(f'bap_yes_price_{x[2]}')), "exit_type": "LO", "request_type": "exit", "exit_qty": 1}
                    cancel_and_exit_task = asyncio.create_task(session.put(os.getenv('CANCEL_AND_EXIT_API')+f'{x[3]}', json=load, headers={'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"}))
                    cancel_and_exit_tasks.append(cancel_and_exit_task)
                else:
                    load = {"exit_price": float(r.get(f'bap_no_price_{x[2]}')), "exit_type": "LO", "request_type": "exit", "exit_qty": 1}
                    cancel_and_exit_task = asyncio.create_task(session.put(os.getenv('CANCEL_AND_EXIT_API')+f'{x[3]}', json=load, headers={'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"}))
                    cancel_and_exit_tasks.append(cancel_and_exit_task)
            else:
                task = asyncio.create_task(session.get(os.getenv('CHECK_ORDER_STATUS')+f'{x[3]}?status=EXIT_PENDING', headers={'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"}))
                tasks.append(task)
        result = await asyncio.gather(*tasks)
        cancel_and_exit_result = await asyncio.gather(*cancel_and_exit_tasks)
        for i in range(len(result)):
            res = json.loads(await result[i].text())        
            if(len(res['data']['orderDisplayArray'])==2):
                print("EXIT SUCCESSFULLY", response[i][3])
                sql=f'insert into trades_placeds(transactionId, order_id, eventId, entry_price, exit_price, offer_type, order_type, profit, status, createdAt, updatedAt, tradePlacedAt) values ({response[i][1]}, {response[i][3]}, {response[i][2]}, {response[i][4]}, {res["data"]["order_details"]["exit_price"]}, "LO", "{response[i][6]}", {res["data"]["order_details"]["exit_price"]-response[i][4]}, "EXIT SUCCESSFUL", "{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{str(response[i][8])}")'
                test1 = connection.execute(text(sql))
                connection.commit()
                sql=f'delete from active_orders_placeds where transactionId={response[i][1]}'
                test1 = connection.execute(text(sql))
                connection.commit()
            else:
                print("Error 1:", res)
        for i in range(len(cancel_and_exit_result)):
            res = json.loads(await cancel_and_exit_result[i].text())
            print(res)
            if (res['error']=='Order already completely exited!' or res['message']=='Success' or res['isError']==False):
                test1 = connection.execute(text(f'update active_orders_placeds set `updatedAt`="{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}" where transactionId={x[1]}'))
                connection.commit()
            else:
                print("Error while cancelling and then exiting",res, {"exit_price": r.get(f'bap_no_price_{x[2]}'), "exit_type": "LO", "request_type": "exit", "exit_qty": 1})
    await session.close()
            

asyncio.run(main())
