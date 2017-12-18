const ifaceConfig = require("./interfaces-config.js")("interfaces");

ifaceConfig.read()
    .then(interfaces => {
        ifaceConfig.setInputFile("ifaceWTest");
        console.log("Read:", interfaces);
        return ifaceConfig.write(interfaces);
    })
    .then(bytes=>console.log(`Bytes written: ${bytes}`))
    .catch(console.error);