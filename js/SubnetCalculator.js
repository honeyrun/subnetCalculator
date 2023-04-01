import Network from '../modules/Network.js';

let inputs = $("input");
let requiredNum =  $("#requiredNum");
let subnetArray = [];

const clearInputs = ()=>{
    inputs.val('');
    inputs.eq(0).focus();
}

const verifyInput = ()=>{
    for(let idx=0; idx<4; idx++){
        let figure = parseInt(inputs.eq(idx).val());
        if(0>figure || figure>255){
            alert("Invalid network format");
            clearInputs();
            return false;
        }
    }
    if(requiredNum.val()==null || requiredNum.val()==0) {
        alert("Enter required numbers of subnets or hosts");
        return false;
    }
    return true;
}

const calSubnet = (e)=>{

    e.preventDefault();
    // networkArr should be format of : decimal array - [192, 168, 10, 0]
    // have to check each digit is in range of 0-255 (int)
    // if not, alert->"Invalid network format"

    let networkArr = [];

    for(let idx =0; idx<4; idx++){
        let figure = parseInt(inputs.eq(idx).val());
        networkArr.push(figure);
    }
    
    clearResults();
   
    if(verifyInput()) {
        let re_subnets = null;
        let re_hosts = null;
        let pre = null;

        if(document.getElementsByClassName("radio")[0].checked) {
            re_subnets = requiredNum.val();
        } else if(document.getElementsByClassName("radio")[1].checked) {
            re_hosts = requiredNum.val();
        } else {
            pre = requiredNum.val();
        }

        try {
            let networkObj = new Network(networkArr, re_subnets, re_hosts, pre);
            subnetArray = [...networkObj.subnet_res];
            popData(networkObj.toArray());
            console.log(subnetArray);

        } catch(e) {
            alert(e);
        }
        clearInputs();
    }
}

// Clear Results function
const clearResults = ()=>{
    $('h6').remove();
    $('li').remove();
    $('tbody tr').remove();
    cnt=1;
    cnt2=1;
}

// Pagination implementing function
const crList = (data)=>{
    let li = $('<li></li>');
    let a = $('<a></a>');
    a.text(data);
    a.addClass("page-link");
    if(data == 1){
        a.addClass("active");
    }
    li.append(a);
    li.addClass("page-item");
    if(data=="Next"){
        li.addClass("next");
    }else if(data=="Prev"){
        li.addClass("prev");
    }
    li.click(listHandler);
    $('ul').append(li);
}

// Table data display function(At first)
let cnt  = 1;
let cnt2 = 1;
let pageNum = 25;

const popData = (netData)=>{
    clearResults();

    // Basic Network Info
    // get object and use for-in to populate the table???????
    let textArray = ["Original IP : ","Class : ","Prifix Notation : ","Subnet Mask : "];
    for(let i=0; i<4;i++){
        let h6 = $("<h6></h6>");
        h6.text(textArray[i] + netData[i]);
        h6.text(h6.text().replaceAll(',','.'));
        $("div.basic").append(h6);
    }

    // Network Details
    subnetArray.map((val,key)=>{
        // console.log(val);
        if(cnt <= pageNum){
            let tr = $("<tr></tr>");
            for(let i in val){
                let td = $("<td></td>");
                td.text(val[i]);
                tr.append(td);
            }
            $("tbody").append(tr);
        }
        // Prev button created only when data is over limit
        if(cnt%pageNum==0){
            if(cnt2==1) crList("Prev");
            crList(cnt2);
            cnt2++;
        }
        cnt++;
    })
    console.log("***Fetch data:"+(cnt-1));
    // Next button created only when data is over limit
    if(cnt2>1){
        crList(cnt2); // for last reminder page
        crList("Next");
    } 
}

// Page Handler function
let selectedElement = null;
let currPage = null;

const listHandler = (e) =>{
    if($(e.target).text()=="Prev"){
        prevClick();
    }else
    if($(e.target).text()=="Next"){
        nextClick();
    }else{
        selectedElement = e.target;
        $('.page-link').removeClass("active");
        $(selectedElement).addClass("active");
        // console.log($(selectedElement).text());
        currPage = $(selectedElement).text();
        pageRefresh(currPage);
    }
}

// Move to Previous Page
const prevClick = () =>{
    // console.log($('a.active').text());
    if(currPage>1){ // until first page
        selectedElement = $('a.active');
        $(selectedElement).removeClass("active");
        selectedElement.parent().prev().children().addClass("active");
        currPage = $('a.active').text();
        pageRefresh(currPage);
    }
}

// Move to Next Page
const nextClick = () =>{
    if(currPage<cnt2){ // until last page
        selectedElement = $('a.active');
        $(selectedElement).removeClass("active");
        selectedElement.parent().next().children().addClass("active");
        currPage = $('a.active').text();
        pageRefresh(currPage);
    };
}

// Table data display function(Change Pages)
const pageRefresh = (page) =>{
    console.log("Page:"+page+"/ Cnt2:"+cnt2);
    $("tbody tr").remove();
    cnt = 1; //set defalut
    page = parseInt(page);
    subnetArray.map((val,key)=>{
        if(cnt > page*pageNum-pageNum && cnt <= page*pageNum){
            // console.log(val);
            let tr = $("<tr></tr>");
            for(let i in val){
                let td = $("<td></td>");
                td.text(val[i]);
                tr.append(td);
            }
            $("tbody").append(tr);
        }
        cnt++;
    })
}

$("form").submit(calSubnet);
