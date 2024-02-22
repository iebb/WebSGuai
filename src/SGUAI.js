
const characteristicUuid = "0000ff01-0000-1000-8000-00805f9b34fb"
const characteristic2Uuid = "0000ff02-0000-1000-8000-00805f9b34fb"
const serviceUuid = "0000ff00-0000-1000-8000-00805f9b34fb"


const packCommand = (cmd, direction=1, args=[]) => {
  return new Uint8Array([0xff, 0x55, 6 + args.length, 0, direction, cmd, ...args]);
}
export class SGUAI {



  get connected() {
    return this?.device?.gatt?.connected;
  }

  constructor() {
    this.queue = [];
    this.inQueue = false;
    this.autoRefresh = false;
    this.refreshInterval = setInterval(async () => {
      if (this.connected && this.autoRefresh) {
        await this.refresh();
      }
    }, 1000 * 30);
  }


  setConnected = () => {

  }
  disconnectionCallback = () => {
    console.log("dummy");
  }


  async discovery() {
    const options = {
      filters: [{ namePrefix: "SGUAI-" }],
      optionalServices: [serviceUuid]
    };
    return await navigator.bluetooth.requestDevice(options);
  }

  async resolveQueue() {
    if (this.inQueue) return;
    this.inQueue = true;
    while(this.queue.length > 0) {
      try {
        await this.characteristic.writeValue(
          this.queue.shift());
      } catch (e) {
        console.error(e);
      }
    }
    this.inQueue = false;
  }

  async enqueueWrite(value) {
    this.queue.push(value);
    await this.resolveQueue();
  }

  async sendCommand(cmd, direction, args) {
    if (!this.characteristic || !this.connected) {
      return;
    }
    const _packed = packCommand(cmd, direction, args);
    return await this.enqueueWrite(_packed);
  }

  async send(cmd, args) {
    if (!this.characteristic || !this.connected) {
      return;
    }
    const _packed = packCommand(cmd, 2, args);
    return await this.enqueueWrite(_packed);
  }

  async readByCallback(cmd, args, callback) {
    if (!this.characteristic || !this.connected) {
      throw Error("Device not connected")
    }
    const _packed = packCommand(cmd, 1, args);
    this.responseCallback[cmd] = callback;
    await this.enqueueWrite(_packed);
  }

  async read(cmd, args = []) {
    if (!this.characteristic || !this.connected) {
      throw Error("Device not connected")
    }
    const _packed = packCommand(cmd, 1, args);
    await this.enqueueWrite(_packed);
    return await this.characteristic2.readValue();
  }

  async init() {
    // 04 635144e5 00 0320
    const buf = new ArrayBuffer(7);
    const dv = new DataView(buf);
    dv.setInt32(0, (+new Date()) / 1000);
    const tzOffset = new Date().getTimezoneOffset() * 10 / 6;
    dv.setInt8(4, tzOffset > 0 ? 1 : 0);
    dv.setInt16(5, Math.abs(tzOffset));

    await this.send(0x4, new Uint8Array(buf));

    await this.read(0x23, []);
    await this.read(0x24, []);
    await this.read(0x27, []);

    await this.read(0x3, []);
    await this.read(0x14, []);

    await this.refresh();
  }

  async refresh() {
    if (this.connected) {
      await this.read(0x2, []);
      await this.read(0x1, []);
      await this.read(0xb, []);
      this.setConnected(+new Date());
    }
  }

  async refreshAll() {
    if (this.connected) {
      await this.read(0x23, []);
      await this.read(0x24, []);
      await this.read(0x27, []);

      await this.read(0x3, []);
      await this.read(0x14, []);

      await this.read(0x2, []);
      await this.read(0x1, []);
      await this.read(0xb, []);
      this.setConnected(+new Date());
    }
  }

  handler = (e) => {
    const value = e.target.value;
    this.slices = this.slices.concat(...new Uint8Array(value.buffer));

    if ((
      value.byteLength < 20
    ) && (
      value.byteLength >= 2 &&
      value.getUint16(value.byteLength - 2) === 0x0d0a
    )) {
      // console.log("0x0d0a detected, assemble", this.slices);
      const _slices = [...this.slices];
      this.slices = [];
      const merged = new DataView(new Uint8Array(_slices).buffer);
      const msgType = merged.getUint8(2);
      this.responses[msgType] = merged;
      if (this.responseCallback[msgType]) {
        this.responseCallback[msgType](merged);
      }

      const a = [];
      for (let i = 0; i < merged.byteLength; i++) {
        a.push(('00' + merged.getUint8(i).toString(16)).slice(-2));
      }
      console.log(merged.getUint8(2), '> ' + a.join(' '));

    }
  }

  async connect(device= null) {
    if (!device) {
      device = await this.discovery();
    }
    this.device = device;
    device.addEventListener('gattserverdisconnected', () => {
      this.disconnectionCallback();
    });
    this.gattService = await this.device.gatt.connect();
    this.service = await this.gattService.getPrimaryService(serviceUuid);
    this.characteristic = await this.service.getCharacteristic(characteristicUuid);
    this.characteristic2 = await this.service.getCharacteristic(characteristic2Uuid);
    this.characteristic2.addEventListener('characteristicvaluechanged', this.handler);
    await this.characteristic2.startNotifications();
    this.slices = [];
    this.responses = {};
    this.responseCallback = {};

    this.init();
    return this;
  }
}