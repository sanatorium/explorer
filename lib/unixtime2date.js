module.exports = {
  unixtime2date: function(unixtime) {
    var a = new Date(unixtime*1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var suffix = 'th'
    if (date == 1 || date == 21 || date == 31)  suffix = 'st';
    if (date == 2 || date == 22 || date == 32)  suffix = 'nd';
    if (date == 3 || date == 23)   suffix = 'rd';
    if (hour < 10)   hour = '0' + hour;
    if (min < 10)   min = '0' + min;
    if (sec < 10)   sec = '0' + sec;
    var time = date + suffix + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  },
  seconds2days: function(seconds) {
    //var seconds = parseInt(123456, 10);

    var days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    var hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    var mnts = Math.floor(seconds / 60);
    seconds  -= mnts*60;
    var time = days+" Days, "+hrs+" Hrs, "+mnts+" Min, "+seconds+" Sec";
    return time;
  },
};
