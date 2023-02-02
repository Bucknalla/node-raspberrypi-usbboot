import { UsbbootDevice, UsbbootScanner } from '../../lib';
import { exec } from 'mz/child_process';

const scanner = new UsbbootScanner();

before(async () => {
	const port = 0
	await exec(
		`uhubctl -r 1000 -a cycle -p ${port}`,
	).catch(() => {
		console.log(`Failed. Check that uhubctl is installed and available.`);
	});
})

describe('Mount Compute Module', () => {
	it('should always attach and detach', (done) => {
		console.log('waiting for BCM2835/6/7');

		scanner.on('attach', (usbbootDevice: UsbbootDevice) => {
			console.log('device attached', usbbootDevice.portId);
			usbbootDevice.on('progress', (progress: number) => {
				console.log('progress', usbbootDevice.portId, progress, '%');
				if (progress === 100) {
					console.log('device', usbbootDevice.portId, 'is ready');
				}
			});
		});

		scanner.on('detach', (usbbootDevice: UsbbootDevice) => {
			usbbootDevice.removeAllListeners();
			console.log('device', usbbootDevice.portId, 'detached');
			done();
		});

		scanner.start();
	}).timeout(10000);

	// it('should see compute module in filesystem', (done) => {});
});

after(async () => {
	console.log('stopping scanner');
	await scanner.stop();
});
