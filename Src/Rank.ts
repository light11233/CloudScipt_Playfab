handlers.GetRank = getRank;


interface IRankResult extends IResult {

    LevelRanks: IRankData[];

    CoinRanks: IRankData[];

    InstanceRanks: IRankData[];

    CollectionRanks: IRankData[];


}


interface IRankData {
    Guid: string;
    Rank: number;
    ImageUrl: string;
    Name: string;
    Level: number;
    Coin: number;
    Instance: number;
    Collection: number;
    IsSelf: boolean;

}

interface IStorage {
    Coin: number,
    Level: number,
    Instance: number,
    Collection: number
}





function getRank(args: any): IRankResult {

    let maxNum = 100;//TODO

    let constrains: PlayFabServerModels.PlayerProfileViewConstraints = <PlayFabServerModels.PlayerProfileViewConstraints>{};
    constrains.ShowAvatarUrl = true;
    constrains.ShowDisplayName = true;
    constrains.ShowLocations = true;
    constrains.ShowStatistics = true;
    constrains.ShowTags = true;
    let result: IRankResult = <IRankResult>{}
    let copy: { [key: string]: IStorage } = {}
    result.CoinRanks = getRankDatas(KEY_Statistics_Coin, maxNum, constrains, copy);
    result.CollectionRanks = getRankDatas(KEY_Statistics_Collection, maxNum, constrains, copy);
    result.InstanceRanks = getRankDatas(KEY_Statistics_Instance, maxNum, constrains, copy);
    result.LevelRanks = getRankDatas(KEY_Statistics_Level, maxNum, constrains, copy);


    result.CoinRanks = changeRankDatas(KEY_Statistics_Coin, result.CoinRanks, copy);

    result.CollectionRanks = changeRankDatas(KEY_Statistics_Collection, result.CollectionRanks, copy);
    result.InstanceRanks = changeRankDatas(KEY_Statistics_Instance, result.InstanceRanks, copy);
    result.LevelRanks = changeRankDatas(KEY_Statistics_Level, result.LevelRanks, copy);



    result.id = Func_Code.SC_GET_RANKS;
    return result;
}

function getRankDatas(key: string, max: number, constranins: PlayFabServerModels.PlayerProfileViewConstraints, copy: { [key: string]: IStorage }): IRankData[] {
    let getLeaderborad = server.GetLeaderboard({
        MaxResultsCount: max,
        ProfileConstraints: constranins,
        StartPosition: 0,
        StatisticName: key
    }).Leaderboard;

    if (getLeaderborad.length > 0) {
        let rankDatas: IRankData[] = []

        for (const lb of getLeaderborad) {
            let rank: IRankData = <IRankData>{};
            rank.Guid = lb.PlayFabId;
            rank.Rank = lb.Position;
            rank.ImageUrl = lb.Profile.AvatarUrl;
            rank.Name = lb.DisplayName;
            rank.IsSelf = currentPlayerId == lb.PlayFabId;
            if (key == KEY_Statistics_Coin) {
                rank.Coin = lb.StatValue;
            } else if (key == KEY_Statistics_Collection) {
                rank.Collection = lb.StatValue
            } else if (key == KEY_Statistics_Instance) {
                rank.Instance = lb.StatValue
            } else if (key == KEY_Statistics_Level) {
                rank.Level = lb.StatValue;
            }
            rankDatas.push(rank);
            let storage: IStorage;
            if (copy.hasOwnProperty(rank.Guid)) {
                storage = copy[rank.Guid];
            } else {
                storage = <IStorage>{}
            }
            if (key == KEY_Statistics_Coin) {
                storage.Coin = lb.StatValue
            } else if (key == KEY_Statistics_Collection) {
                storage.Collection = lb.StatValue;
            } else if (key == KEY_Statistics_Instance) {
                storage.Instance = lb.StatValue;
            } else if (key == KEY_Statistics_Level) {
                storage.Level = lb.StatValue;
            }
            copy[rank.Guid] = storage;
        }
        return rankDatas;
    }
    return null;
}

function changeRankDatas(key: string, datas: IRankData[], copy: { [key: string]: IStorage }): IRankData[] {
    if (datas != null) {

        if (key == KEY_Statistics_Coin) {
           for (const key in copy) {
               if (copy.hasOwnProperty(key)) {
                   const element = copy[key];
                   log.debug("Copy:" + JSON.stringify(element));
               }
           }
        }
        if (key == KEY_Statistics_Coin) {
            for (const c of datas) {
                log.debug("Before:" + JSON.stringify(c));
            }
        }
       
        for (const r of datas) {
            if (copy.hasOwnProperty(r.Guid)) {
                let index: number = datas.indexOf(r);
                let storage = copy[r.Guid];
                if (r.Coin <= 0) {
                    r.Coin = storage.Coin;
                }
                if (key == KEY_Statistics_Coin) {
                    log.debug(String(r.Level));
                }
               
                if (String(r.Level)=='undefind'||r.Level<=0) {
                    r.Level = storage.Level;
                }
                if (key == KEY_Statistics_Coin) {
                    log.debug(r.Level.toString());
                }
              
                if (r.Collection <= 0) {
                    r.Collection = storage.Collection;
                }
                if (r.Instance <= 0) {
                    r.Instance = storage.Instance;
                }
                datas[index] = r;
            }
        }
        if (key == KEY_Statistics_Coin) {
            for (const c of datas) {
                log.debug("After:" + JSON.stringify(c));
            }
        }

    }


    return datas;
}



