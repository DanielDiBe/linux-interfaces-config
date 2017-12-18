# linux-interfaces-config
Read, parse and write the linux /etc/network/interfaces file to check and change network connectivity.

This module is intended for use on embedded linux systems that require configuring the network interfaces and retain this configuration after system reboot.

Currently only Debian and other /etc/network/interfaces file format compatible platforms can be managed with this module.

### Notes
Promise based

Node >= 6

Comments and unknown options are ignored (and lost if using a full read().then(write) cycle)

No special attempt to prevent code injection on write()

### Motivation
There are multiple packages to manage the network interfaces by use of the 'ip' or 'ifconfig' commands. But these configuration is not maintained after reboot.

Although there are some packages published to achieve this by reading and writing the /etc/network/interfaces file, these are incomplete (only offering writing but not reading), or require special permissions to execute command dependencies.

The 'linux-interfaces-config' module is able to parse and write this configuration file with just making use of the standard Node.js library to get I/O access to the file.

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
            ip4: {
                config: 'dhcp',
                // WPA protected Wi-Fi configuration
                wpaSsid: 'MY_WIFI_NAME',
                wpaPsk: 'WIFI-PASSWORD'
            },
            ip6: { config: 'dhcp' }
        }
    })
    .then(bytes=>console.log(`Bytes written: ${bytes}`));
```

When configuring a Wi-Fi with WPA security you might wish to use the [PSK HASH](https://wiki.debian.org/WiFi/HowToUse#WPA-PSK_and_WPA2-PSK) instead of the plain password.