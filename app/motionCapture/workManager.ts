export class WorkerManager {
    private workers: { [deviceId: string]: Worker } = {};
    private callbacks: { [id: string]: (result: any) => void } = {};
  
    constructor(private workerScript: string) {}
  
    createWorker(deviceId: string) {
      if (this.workers[deviceId]) {
        return;
      }
  
      const worker = new Worker(new URL(this.workerScript, import.meta.url));
  
      worker.onmessage = (event) => {
        const { id, result, type } = event.data;
        if (type === 'PYTHON_RESULT' && this.callbacks[id]) {
          this.callbacks[id](result);
          delete this.callbacks[id];
        }
      };
  
      this.workers[deviceId] = worker;
    }
  
    runTask(deviceId: string, buffer: ArrayBuffer): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
        const id = `${deviceId}-${Date.now()}`;
        this.callbacks[id] = resolve;
        this.workers[deviceId].postMessage({ id, buffer, deviceId }, [buffer]);
      });
    }
  
    terminateWorker(deviceId: string) {
      if (this.workers[deviceId]) {
        this.workers[deviceId].terminate();
        delete this.workers[deviceId];
      }
    }
  
    terminateAll() {
      for (const deviceId in this.workers) {
        this.terminateWorker(deviceId);
      }
    }
  }
  