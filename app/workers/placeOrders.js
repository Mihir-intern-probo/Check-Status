const {spawn} = require('child_process');
const { workerData, parentPort } = require('worker_threads');

const placeOrders = async () => {
    try {
        const pythonProcess =  spawn("python3", ["app/Algos/placeOrderAndExit.py"]);
        pythonProcess.stdout.on('data',  (data)=>{
            console.log(data.toString())
        });
        
        pythonProcess.stderr.on('data',(data)=>{
            console.log(`result: ${data}`);
        })
        pythonProcess.on('close',(code)=>{
            // console.log(`code exited with ${code}`);
        })
        let loop = setTimeout(()=>{placeOrders()},1000)
    }catch(err){
        console.log("Error while running Algorithm", err);
    }
}

const main = async() => {
    const ans = await placeOrders();
    parentPort.postMessage(ans);
}

main()
