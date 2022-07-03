const {parentPort, workerData } = require('worker_threads');

function sumArray(input_data: number[]) {
  return input_data.reduce((accumulator, current) => {
    return accumulator + current;
  }, 0);
}

parentPort.postMessage(sumArray(workerData.value));
