handlers.SendMailFormServer = SendMailFormServer;
handlers.RefreshEveryDay = RefreshEveryDay;
function SendMailFormServer(args, content) {
    var type = args['Types'];
    var itemIds = args['ItemIds'];
    var counts = args['ItemCounts'];
    var sender = {
        Name: "Service",
        Level: 0,
        ImageUrl: ''
    };
    SendToEmail(currentPlayerId, type, itemIds, counts, sender);
}
function RefreshEveryDay(args, content) {
    var timeTamp = GetTimeStamp();
    refreshMails(timeTamp);
}
