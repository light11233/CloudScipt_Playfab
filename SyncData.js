handlers.SyncClientToService = syncClicntToService;
var SYNC_VERSION = "__SYNC_VERSION__";
var Func_Code;
(function (Func_Code) {
    Func_Code[Func_Code["SC_SYNC_CLIENTTOSERVICE"] = 1005] = "SC_SYNC_CLIENTTOSERVICE";
})(Func_Code || (Func_Code = {}));
function syncClicntToService(args) {
    var count = args["Count"];
    if (count <= 0) {
        return;
    }
    var keys = args["Keys"];
    var Values = args["Values"];
    var entityId = args["EntityId"];
    var entityType = args["EntityType"];
    var ret = {};
    for (var i = 0; i < count; i++) {
        var key = keys[i];
        var data = Values[i];
        var status_1 = data.Status;
        if (status_1 == 101) {
            var sData = setObjects(entityId, entityType, key, data);
            ret[key] = sData;
        }
        else if (status_1 == 103) {
            //Update data
            var sData = getObjects(entityId, entityType, key);
            if (data.TimeStamp != sData.TimeStamp) {
                log.error("TimeStamp is not equal. C:{}.S{}", data.TimeStamp);
                return;
            }
            sData = setObjects(entityId, entityType, key, data);
            ret[key] = sData;
        }
        else {
            log.error("you sync Data Status:{}", status_1);
            return;
        }
    }
    server.UpdateUserInternalData({
        PlayFabId: currentPlayerId,
        Data: { SYNC_VERSION: GetTimeStamp().toString() }
    });
    return { id: Func_Code.SC_SYNC_CLIENTTOSERVICE, Datas: ret };
}
function GetEntityKey() {
    var result = entity.GetEntityToken({});
    return result.Entity;
}
function GetTimeStamp() {
    var time = server.GetTime({});
    var d = Date.parse(time.Time);
    return d;
}
function setObjects(id, type, key, value) {
    //let entityKey:PlayFabAuthenticationModels.EntityKey= GetEntityKey();   
    value.Status = 104;
    value.TimeStamp = GetTimeStamp();
    var setObj = {
        ObjectName: key,
        DataObject: value,
    };
    var response = entity.SetObjects({ Entity: { Id: id, Type: type }, Objects: [setObj] });
    return value;
}
function getObjects(id, type, key) {
    //let entityKey:PlayFabAuthenticationModels.EntityKey= GetEntityKey();
    var response = entity.GetObjects({
        Entity: { Id: id, Type: type },
    });
    var obj = response.Objects[key];
    if (obj == null) {
        log.error("you get Obj is invaild . Key:{0}", key);
        return null;
    }
    var data = obj.DataObject;
    if (data == null) {
        log.error("you get Obj is not Idata. Key:{0}", key);
        return null;
    }
    return data;
}
