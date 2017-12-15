/*
MIT License

Copyright (c) 2017 Daniel Diaz Benito

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const fs = require("fs");

const getLineWords = (str) => {
    // Returns all words in the line after trimming spaces and removing comments
    let i = str.indexOf("#");
    if(-1===i)
        return str.trim().split(" ").filter((w)=>w);
    return str.slice(0, i).trim().split(" ").filter((w)=>w);
};

module.exports = (inputFile) => {
    if(!inputFile)
        inputFile = "/etc/network/interfaces";
    return {
        write: (callback) => {

        },
        read: (callback) => {
            if(!callback)
                callback = console.log;
            fs.readFile(inputFile, "utf8", (err, data) => {
                if(err)
                {
                    callback(err);
                    return;
                }
                let iface;
                let interfaces = {};
                const getInterface = (iface) => {
                    // Retrieve this interface object, ensuring it exists by creating
                    // a new one if not
                    if(interfaces[iface])
                        return interfaces[iface];
                    return interfaces[iface] = {
                        auto: false,
                        hotplug: false
                    };
                };

                let words;
                let ipfamily;
                // Iterate through the interfaces lines
                data = data.split("\n");
                let lineCount = data.length;
                for(let i=0;i<lineCount;i++)
                {
                    words = getLineWords(data[i]);
                    // Skip empty lines
                    if(!words.length)
                        continue;
                    // Look up iface and whether it is dhcp, static or manual
                    // Example: iface eth0 inet [dhcp|static|manual]
                    if(words[0]==="iface")
                    {
                        if(words.length>=4)
                        {
                            // Ensure declaration of this interface and ipfamily addresses
                            if(words[2]==="inet" || words[2]==="inet4")
                                getInterface(words[1]).ip4 = ipfamily = {};
                            else if(words[2]==="inet6")
                                getInterface(words[1]).ip6 = ipfamily = {};
                            else
                                ipfamily = null;
                            // If no family found skip and continue to parse error
                            if(ipfamily!==null)
                            {
                                if(["dhcp", "static", "manual", "auto", "loopback"].includes(words[3]))
                                {
                                    ipfamily.config = words[3];
                                    continue;
                                }
                            }
                        }
                        console.error(`Error parsing interfaces line ${i}: '${data[i]}'`);
                        continue;
                    }
                    else if(words[0]==="auto")
                    {
                        getInterface(words[1]).auto = true;
                        continue;
                    }
                    else if(words[0]==="allow-hotplug")
                    {
                        getInterface(words[1]).hotplug = true;
                        continue;
                    }

                    // If no interface is loaded there is no sense for the static line config
                    if(!ipfamily)
                        continue;
                    switch(words[0])
                    {
                        case "address":
                            ipfamily.address = words[1];
                            break;
                        case "netmask":
                            ipfamily.netmask = words[1];
                            break;
                        case "gateway":
                            ipfamily.gateway = words[1];
                            break;
                        case "network":
                            ipfamily.network = words[1];
                            break;
                        case "dns-nameservers":
                            ipfamily.dnsNameservers = words.slice(1);
                            break;
                        default:
                            console.error(`Unrecognized config option ${words[0]} at line ${i}`)
                            break;
                    }
                }
                callback(null, interfaces);
            });
        }
    };
};