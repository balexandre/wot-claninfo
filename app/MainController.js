/* Main Controller */

(function () {

    var app = angular.module('wotClanInfo');

    var MainController = function ($scope, $log, $location, wotSearch) {
        $log.info("MainController loaded");

        // ##################################################################################
        // # Clan info
        var tanksPerCall = 200,
            defaultClanId = "500024948"; // ORDEM Clan data if nothing is used
                                         // TODO: redirect to a /help page to show how can be done

        var onError = function (reason) {
            $log.error(reason);
            $scope.error = reason;
        };
        var onClanComplete = function (response) {
            $log.info("onClanComplete");
            $log.debug(response);
            $scope.clan = response.data[_.keys(response.data)[0]];

            var tanks = [];
            $scope.playersList = [];
            for (var i = 0; i < _.keys($scope.clan.members).length; i++) {
                var playerId = _.keys($scope.clan.members)[i];
                tanks.push(playerId);

                $scope.playersList[playerId] = $scope.clan.members[playerId];
            }

            $scope.pageTitle = $scope.clan.abbreviation + " - Clan Info";
            $log.info("Title: " + $scope.pageTitle);
            document.title = $scope.pageTitle;

            $log.debug(tanks);
            wotSearch.getPlayerTanks(tanks).then(onTanksComplete, onError); // get all allTanksByPlayerId for each member
        };

        // ##################################################################################
        // # Vehicles Info
        var onTanksComplete = function (response) {
            $log.info("onTanksComplete");
            $log.debug(response);

            /*
            {
            mark_of_mastery: 4,
            statistics: {
            battles: 2069,
            wins: 993 },
            tank_id: 13345
            }
            */
            var tanks = [];
            for (var i = 0; i < _.keys($scope.clan.members).length; i++) {
                var playerId = _.keys($scope.clan.members)[i];
                $scope.players.push(playerId);

                $scope.allTanksByPlayerId[playerId] = response.data[playerId];
                $scope.allTanksByPlayerId2[playerId] = [];

                for (var b = 0; b < $scope.allTanksByPlayerId[playerId].length; b++) {
                    var tankInfo = $scope.allTanksByPlayerId[playerId][b],
                        tankId = tankInfo.tank_id;

                    tanks.push(tankId);
                    $scope.allTanksByPlayerId2[playerId][tankId] = tankInfo;
                }
            }

            var uniqueTanks = _.union(tanks);
            $log.info("Clan has " + uniqueTanks.length + " unique vehicles");
            wotSearch.getTank(uniqueTanks.join()).then(onTankInfoComplete, onError); // get info of all tanks (so we know the tier, name and img)
        };
        var onTankInfoComplete = function (response) {
            $log.info("onTankInfoComplete");
            $log.debug(response);

            $scope.allTankInfos = [];

            for (var i = 0; i < _.keys(response.data).length; i++) {
                var tankId = _.keys(response.data)[i];

                if (response.data[tankId]) {
                    // is a valid tank?
                    if (response.data[tankId].level === 6 ||
                        response.data[tankId].level === 8 ||
                        response.data[tankId].level === 10) {
                        $scope.allTankInfos[tankId] = response.data[tankId];

                        switch (response.data[tankId].level) {
                            case 6: $scope.allTankInfosTier6.push(tankId); break;
                            case 8: $scope.allTankInfosTier8.push(tankId); break;
                            case 10: $scope.allTankInfosTier10.push(tankId); break;
                            default: break;
                        }
                    }
                }
            }

            //$log.info("valid allTanksByPlayerId");
            //$log.debug($scope.allTankInfos);

            // remove tanks that do not belong to tiers 6, 8 and 10 from allTanksByPlayerId
            for (var i = 0; i < _.keys($scope.clan.members).length; i++) {
                var playerId = _.keys($scope.clan.members)[i];

                var tanksByThisPlayer = $scope.allTanksByPlayerId[playerId];
                $scope.allTanksByPlayerId[playerId] = []; // reset

                $log.info("tanksByThisPlayer.length (before) : " + tanksByThisPlayer.length);

                for (var b = 0; b < tanksByThisPlayer.length; b++) {
                    var tankId = tanksByThisPlayer[b].tank_id,
                        tankInfo = $scope.allTankInfos[tankId];

                    if (tankId && tankInfo && (tankInfo.level === 6 || tankInfo.level === 8 || tankInfo.level === 10)) {

                        //
                        if ($scope.playersByTankId[tankId] === undefined) {
                            $scope.playersByTankId[tankId] = [];
                        }
                        //
                        if ($scope.playerNamesByTankId[tankId] === undefined) {
                            $scope.playerNamesByTankId[tankId] = [];
                        }
                        $scope.playersByTankId[tankId].push(playerId);
                        $scope.playerNamesByTankId[tankId].push($scope.clan.members[playerId].account_name);

                        $scope.allTanksByPlayerId[playerId].push(tankId);
                    }
                }

                $log.info("tanksByThisPlayer.length (after) : " + $scope.allTanksByPlayerId[playerId].length);
            }

            $log.info("start");
            $('#tabtiers a[role="tab"]:first').click();

            setTimeout(function () {
                $log.info("sort allTanksByPlayerId");
                $("ul.list-tier").each(function () {
                    var ul = $(this),
                        li = ul.children('li');

                    li.detach().sort(function (a, b) {
                        return $(b).data('sortby') - $(a).data('sortby');
                    });

                    ul.append(li);
                });
                $("ul.list-clan-members").each(function () {
                    var ul = $(this),
                        li = ul.children('li');

                    li.detach().sort(function (a, b) {
                        return $(b).data('sortby') - $(a).data('sortby');
                    });

                    ul.append(li);
                });
                $(".tank-img").popover();

                /*
                $log.info("sorting fans");
                for(var i=0; i<_.keys($scope.playerNamesByTankId).length; i++){
                var tankId = _.keys($scope.playerNamesByTankId)[i];

                $log.info("original");

                $log.info("sorting fans");
                $scope.playerNamesByTankId[tankId] = $scope.playerNamesByTankId[tankId].sort(function(a, b) {
                return a[1] > b[1] ? 1 : -1;
                });
                }*/
            }, 1000);
        };


        // ##################################################################################
        $scope.showTanksByPlayerId = function (playerId) {
            $log.info("showing only tanks from " + playerId);
            $scope.currentPlayer = playerId;

            // make it active
            $(".list-clan-members li").removeClass("active");
            $(".list-clan-members li[data-id=" + playerId + "]").addClass("active");

            // reset
            $scope.allTankInfosTier6 = [];
            $scope.allTankInfosTier8 = [];
            $scope.allTankInfosTier10 = [];

            for (var i = 0; i < $scope.allTanksByPlayerId[playerId].length; i++) {
                var tankId = $scope.allTanksByPlayerId[playerId][i];

                if (playerId === null) {
                    // all allTanksByPlayerId

                    switch ($scope.allTankInfos[tankId].level) {
                        case 6: $scope.allTankInfosTier6.push(tankId); break;
                        case 8: $scope.allTankInfosTier8.push(tankId); break;
                        case 10: $scope.allTankInfosTier10.push(tankId); break;
                        default: break;
                    }
                }
                else {
                    var ti = $scope.allTankInfos[tankId];

                    if (ti) {
                        // is a valid tank?
                        if (ti.level === 6 || ti.level === 8 || ti.level === 10) {

                            switch ($scope.allTankInfos[tankId].level) {
                                case 6: $scope.allTankInfosTier6.push(tankId); break;
                                case 8: $scope.allTankInfosTier8.push(tankId); break;
                                case 10: $scope.allTankInfosTier10.push(tankId); break;
                                default: break;
                            }
                        }
                    }
                }
            }
        };

        $scope.loadClan = function () {

            $scope.tabModel = null;
            $scope.clan = {};                   // clan info
            $scope.allTanksByPlayerId = [];
            $scope.allTanksByPlayerId2 = [];
            $scope.allTankInfos = [];
            $scope.allTankInfosTier6 = [];
            $scope.allTankInfosTier8 = [];
            $scope.allTankInfosTier10 = [];
            $scope.playersByTankId = [];
            $scope.playerNamesByTankId = [];
            $scope.players = [];
            $scope.playersList = [];
            $scope.currentPlayer = null;
            $scope.year = (new Date()).getFullYear(); // footer year

            // load 8BMC Clan info
            wotSearch.getClan($scope.clanId).then(onClanComplete, onError);
        };
        $scope.reload = function (clanId) {
            $scope.clanId = clanId;
            $location.hash($scope.clanId);
            loadClan();
        };

        $scope.clanId = $location.hash() === "" ? defaultClanId : $location.hash();
        $scope.loadClan();

        $scope.year = (new Date()).getFullYear(); // footer year

        $('#tabtiers a[role="tab"]').on('click', function (e) {
            e.preventDefault();

            $(this).tab('show');
        });
    };

    app.controller("MainController", ["$scope", "$log", "$location", "wotSearch", MainController]);

} ());