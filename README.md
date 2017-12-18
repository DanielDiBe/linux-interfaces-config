# linux-interfaces-config
Read, parse and write the linux /etc/network/interfaces file to check and change network connectivity.

### Notes
Promise based

Node >= 6

Comments and unknown options are ignored (and lost if using a full read().then(write) cycle)

## Installation
```
npm install --save linux-interfaces-config
```

## Setup
```
const interfacesConfig = require("linux-interfaces-config")();
```

You can set a different interfaces file to read/write:
```
const interfacesConfig = require("linux-interfaces-config")("/path/to/interfaces/file");
```
Or even change it on runtime:
```
interfacesConfig.setInputFile("/path/to/interfaces/file");
```

## Read interfaces configuration
```
interfacesConfig.read().then(console.log);
```

## Write interfaces configuration
```
interfacesConfig.write({
        eth0: {
            auto: true,
            hotplug: true,
            ip4: { config: 'static',
                address: '192.168.1.111',
                netmask: '255.255.255.0',
                gateway: '192.168.1.1',
                dnsNameservers: ['8.8.8.8', '8.8.8.9']
            }
        },
        wlan0: {
            auto: true,
            hotplug: true,
            ip4: { config: 'dhcp' },
            ip4: { config: 'dhcp' }
        }
    })
    .then(bytes=>console.log(`Bytes written: ${bytes}`));
```
