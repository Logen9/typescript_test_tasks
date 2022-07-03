import { Worker } from 'worker_threads';
import { performance } from 'perf_hooks';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function getRandomArray(total_size: number, max: number): number[] {
  const arrayName = [];
  for (let i = 0; i < total_size; i++) {
    arrayName.push(getRandomInt(max));
  }
  return arrayName;
}

function spliceArrayIntoChunks(input_data: number[], thread_count: number): number[][] {
  const chunkSize = input_data.length / thread_count;
  const spliced_array: number[][] = [];
  for (let i = 0; i < input_data.length; i += chunkSize) {
    const chunk = input_data.slice(i, i + chunkSize);
    spliced_array.push(chunk);
  }
  return spliced_array;
}

const threads: number = +process.argv[2];
const workers = new Set<Worker>(); //alternative here would be to have implementation of (apparently) more classical WorkerPool -> for one-time launches, we have high overhead to create new workers
const spliced_array: number[][] = spliceArrayIntoChunks(getRandomArray(2000, 100), threads);

const startTime = performance.now();

for (let i = 0; i < threads; i++) {
  const worker = new Worker('./worker.js', {
    workerData: {
      value: spliced_array[i],
      path: './worker.ts'
    }
  });
  workers.add(worker);
}

let final_sum = 0;
for (const worker of workers) {
  worker.on('message', (result) => {
    final_sum = final_sum + result;
  });
  worker.on('exit', () => {
    workers.delete(worker);
    if (workers.size === 0) {
      const endTime = performance.now();
      console.log(`Sum is ${final_sum}`);
      console.log(`Calculation of array sum in ${threads} thread(s) took ${endTime - startTime} milliseconds`);
    }
  });
}
