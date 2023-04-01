class Network{

    // ip format : decimal array - [192, 168, 10, 0]
    #original_ip;
    #ip_class;
    #prefix_notation
    #subnet_mask;
    #subnet_res = [];
    
    constructor(original_ip, required_subnets, required_hosts, pre){
        this.#original_ip = original_ip;
        this.#getIpClass();
        this.#getSubnetMaskPrefix(required_subnets,required_hosts,pre);
    }

    get subnet_res(){
        return this.#subnet_res;
    }

    // convert decimal array into binary string  
    // binary string : length 32 / ex) "11111111111111111111111100000000"
    #decToBinStr(decArr) {
        let binaryStr = "";
        for(let digit of decArr) {
            let binary = digit.toString(2);
            binaryStr += binary.padStart(8,'0');
        }
        return binaryStr;
    }

    // convert binary string into decimal array 
    #binStrToDec(binStr) {
        let binArr = binStr.match(/.{1,8}/g);
        let decimalArr = [];
        for(let digit of binArr) {
            let decimal = parseInt(digit,2);
            decimalArr.push(decimal);
        }
        return decimalArr;
    }

    #getIpClass() {
        console.log("IP decimal : ", this.#original_ip);    //log

        let binIp = this.#decToBinStr(this.#original_ip);
        if(binIp.startsWith('0')) {
            this.#ip_class = "A";
        } else if (binIp.startsWith('10')) {
            this.#ip_class = "B";
        } else if (binIp.startsWith('110')) {
            this.#ip_class = "C";
        }
        else {
            // ERROR : for class "D" and "E"
            // calculating not supported -> error msg
            throw new Error("calculating not supported for ip class D, E");
        }

        console.log("IP binary : ", binIp);    //log
        console.log("ip class : ", this.#ip_class);    //log
    }

    #getSubnetMaskPrefix(required_subnets, required_hosts, pre) {

        let defaultMaskBlock = 4;
        let subnetDigit = 0;
        let prefix = pre;
        
        switch(this.#ip_class) {
            case "A":
                defaultMaskBlock = 1;
                break;

            case "B":
                defaultMaskBlock = 2;
                break;

            case "C":
                defaultMaskBlock = 3;
                break;
        }
        let availableDigit = 32-defaultMaskBlock*8;

        if (pre != null) {
            subnetDigit = prefix-defaultMaskBlock*8;
        }

        if(required_subnets != null) {
            availableDigit = availableDigit-2;
            
            // considering the number of available ip addresses, host digit should be at least 2
            // (2 digits host : number of available ip addresses is 2)
            if(required_subnets>Math.pow(2,availableDigit)) {
                // ERROR : too big / subnetting not available
                throw new Error("required subnet number is out of range / subnetting not available");
            } 
            else {
                for(let n=0; n<=availableDigit; n++) {
                    if(Math.pow(2,n) >= required_subnets) {
                        subnetDigit = n;
                        break;
                    }
                }
            }
            prefix = defaultMaskBlock*8+subnetDigit;

        } else if (required_hosts != null) {
            console.log("required hosts : ", required_hosts);   // LOG

            if(required_hosts>Math.pow(2,availableDigit)-2) {
                console.log("required host number is out of range / subnetting not available");   // LOG
                // ERROR : stop running, too big / subnetting not available
                throw new Error("required host number is out of range / subnetting not available");
            } 
            else {
                for(let n=2; n<=availableDigit; n++) {
                    if(Math.pow(2,n)-2 >= required_hosts) {
                        subnetDigit= availableDigit - n;
                        break;
                    }
                }
            }
            prefix = defaultMaskBlock*8+subnetDigit;
        }

        let maskStr = "";
        for (let i=0; i<32; i++) {
            if (i<prefix) {
                maskStr += "1";
            } else {
                maskStr += "0";
            }
        }

        this.#prefix_notation = "/" + prefix;
        this.#subnet_mask = this.#binStrToDec(maskStr);

        console.log("prefix : ", this.#prefix_notation)    //log
        console.log("mask : ", this.#subnet_mask)    //log

        this.#subnetting(defaultMaskBlock, subnetDigit, required_subnets);
    }

    #subnetting(blockNum, subnetDigit, required_subnets) {

        let binIp = this.#decToBinStr(this.#original_ip);
        let binSubnetMk = this.#decToBinStr(this.#subnet_mask);

        let network_Id = "";
        for (let i=0; i<32; i++) {
            if (binIp[i]==1 && binSubnetMk[i]==1) {
                network_Id += "1";
            } else if(binSubnetMk[i]==0){
                break;
            } else {
                network_Id += "0";
            }
        }

        let defaultBlock = network_Id.slice(0,blockNum*8);
        let subnet_part = network_Id.slice(blockNum*8);

        let subnet_part_dec = parseInt(subnet_part,2);

        console.log("networkID :" + network_Id + "/" + "subnet part : " + subnet_part);   //log

        // if) subnetDigit = n
        // available_subnets = 2^n-(decimal number of only subnet_part)
        let available_subnets = Math.pow(2,subnetDigit)-subnet_part_dec;

        if(available_subnets < required_subnets) {
            // ERROR : 
            throw new Error("required subnet number is out of range / constraints : preseved network range");
        } else {

            let hostDigit = 32 - blockNum * 8 - subnetDigit;
            let subnet_base = "0".repeat(hostDigit);
            let host_part1 = "0".repeat(hostDigit-1) + "1";
            let host_part2 = "1".repeat(hostDigit-1) + "0";
            let broadcast = "1".repeat(hostDigit);

            while(subnet_part_dec < Math.pow(2,subnetDigit)) {

                let subnet_part_bin = subnet_part_dec.toString(2);
                subnet_part_bin = subnet_part_bin.padStart(subnetDigit, "0");

                let networkJson = {
                    "Subnet ID" :  this.#binStrToDec(defaultBlock + subnet_part_bin + subnet_base).join("."),
                    "IP address range" :  this.#binStrToDec(defaultBlock + subnet_part_bin + host_part1).join(".") + " - " + this.#binStrToDec(defaultBlock + subnet_part_bin + host_part2).join("."),
                    "Broadcast ID" : this.#binStrToDec(defaultBlock + subnet_part_bin + broadcast).join(".")
                };

                console.log(networkJson);   // log

                this.#subnet_res.push(networkJson);
                subnet_part_dec++;
            }
        }
    }

    toArray(){
        return [this.#original_ip,this.#ip_class,this.#prefix_notation,this.#subnet_mask];
    }
  
}
export default Network;
