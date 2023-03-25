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
load_dotenv()
print("Checking Orders", datetime.datetime.now())
test1 = connection.execute(text(f'select * from active_orders_placeds; '))
response = test1.fetchall()
for x in response:
    if(x[7]=="PENDING"):
        if((datetime.datetime.now()-x[9]).total_seconds()<=5):
            if(x[6]=="BUY"):
                load = {"exit_params": [{"exit_price": x[4]+0.5, "exit_type": "LO", "order_id": x[3]}]}
                res = requests.put(os.getenv('EXIT_API'), json = load, headers = {'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"})    
                res = json.loads(res.content)
                print("BUY EXIT PLACED", x[3])
                if (res["isError"]==False) :
                    print("BUY EXIT APPLIED and MATCHED", x[3], datetime.datetime.now())
                    sql = f'update active_orders_placeds set `status` = "EXIT_PLACED", `updatedAt`= "{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}" where transactionId={x[1]}'
                    test1 = connection.execute(text(sql))
                    connection.commit()
                else:
                    print("Error 3:", res)
            else:
                load = {"exit_params": [{"exit_price": x[4]+0.5, "exit_type": "LO", "order_id": x[3]}]}
                res = requests.put(os.getenv('EXIT_API'), json = load, headers = {'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"})    
                res = json.loads(res.content)
                print("SELL EXIT PLACED", x[3])
                if (res["isError"]==False) :
                    print("SELL EXIT APPLIED and MATCHED", x[3],datetime.datetime.now())
                    sql = f'update active_orders_placeds set `status` = "EXIT_PLACED", `updatedAt`="{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}" where transactionId={x[1]}'
                    test1 = connection.execute(text(sql))
                    connection.commit()
                else:
                    print("Error 2:", res)
        else:
            print(x[3], x[2], os.getenv('CANCEL_API'))
            res = requests.put(os.getenv('CANCEL_API')+f'{x[3]}?eventId={x[2]}', headers={'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"})
            res=json.loads(res.content)
            print("CANCEL PLACED", x[3])
            if(res["isError"]==False):
                print("CANCEL SUCCESSFUL", x[3])
                sql=f'insert into trades_placeds (transactionId, order_id, eventId, entry_price, exit_price, offer_type, order_type, profit, status, createdAt, updatedAt, tradePlacedAt) values ({x[1]}, {x[3]}, {x[2]}, {x[4]}, {x[4]}, "LO", "BUY", {0},"CANCELED" , "{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{str(x[8])}")'
                test1 = connection.execute(text(sql))
                connection.commit()
                sql = f'delete from active_orders_placeds where transactionId={x[1]}'
                test1 = connection.execute(text(sql))
                connection.commit()
            else:
                print("Cancel Failed", res)
    else:
        if(x[7]=='EXIT_SUCCESSFULLY'):
            if((datetime.datetime.now()-x[9]).total_seconds()>=5):
                if(x[6]=="BUY"):
                    load = {"exit_price": float(r.get(f'bap_yes_price_{x[2]}')), "exit_type": "LO", "request_type": "exit", "exit_qty": 1}
                    res = requests.put(os.getenv('CANCEL_AND_EXIT_API')+f'{x[3]}',json=load, headers={'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"})
                    print(res, load)
                    res=json.loads(res.content)
                    print(res)
                    if(res['message']=="Success" or res['isError']==False):
                        test1 = connection.execute(text(f'update active_orders_placeds set `updatedAt`="{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}" where transactionId={x[1]}'))
                        connection.commit()
                    else:
                        print("Error while cancelling and then exiting", {"exit_price": r.get(f'bap_yes_price_{x[2]}'), "exit_type": "LO", "request_type": "exit", "exit_qty": 1})
                else:
                    load = {"exit_price": float(r.get(f'bap_no_price_{x[2]}')), "exit_type": "LO", "request_type": "exit", "exit_qty": 1}
                    res = requests.put(os.getenv('CANCEL_AND_EXIT_API')+f'{x[3]}',json=load, headers={'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"})
                    print(res, load)
                    res=json.loads(res.content)
                    if (res['message']=='Success' or res['isError']==False):
                        test1 = connection.execute(text(f'update active_orders_placeds set `updatedAt`="{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}" where transactionId={x[1]}'))
                        connection.commit()
                    else:
                        print("Error while cancelling and then exiting",res, {"exit_price": r.get(f'bap_no_price_{x[2]}'), "exit_type": "LO", "request_type": "exit", "exit_qty": 1})
            res = requests.get(os.getenv('CHECK_ORDER_STATUS')+f'{x[3]}?status=EXIT_PENDING', headers={'AUTHORIZATION': f'Bearer {os.getenv("AUTH_TOKEN")}', "appId": "in.probo.pro","x-device-os": "ANDROID","x-version-name": "5.38.3"})
            res=json.loads(res.content)
            print("EXIT PLACED CHECKED",x[3])
            if(len(res['data']['orderDisplayArray'])==2):
                print("EXIT SUCCESSFULLY", x[3])
                sql=f'insert into trades_placeds(transactionId, order_id, eventId, entry_price, exit_price, offer_type, order_type, profit, status, createdAt, updatedAt, tradePlacedAt) values ({x[1]}, {x[3]}, {x[2]}, {x[4]}, {res["data"]["order_details"]["exit_price"]}, "LO", "{x[6]}", {res["data"]["order_details"]["exit_price"]-x[4]}, "EXIT SUCCESSFUL", "{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}","{str(x[8])}")'
                test1 = connection.execute(text(sql))
                connection.commit()
                sql=f'delete from active_orders_placeds where transactionId={x[1]}'
                test1 = connection.execute(text(sql))
                connection.commit()
            else:
                print("Error 1:", res)
