!function(){var n=function(n,t){var a="3f6379825637847c3c4c6c71b3530cdb",i="http://api.worldoftanks.eu/wot/account/info/?application_id="+a+"&account_id=",o="http://api.worldoftanks.eu/wot/clan/info/?application_id="+a+"&clan_id=",r="http://api.worldoftanks.com/wot/encyclopedia/tankinfo/?application_id=demo&tank_id=",e="http://api.worldoftanks.eu/wot/account/tanks/?application_id="+a+"&account_id=",f="http://api.worldoftanks.eu/wot/tanks/stats/?application_id="+a+"&in_garage=1&account_id=",c="http://api.worldoftanks.eu/wot/clan/list/?application_id="+a+"&search=",u="http://api.worldoftanks.eu/wot/account/list/?application_id="+a+"&search=",l=["client_language"],p=[""],d=["image","level","name_i18n","type","type_i18n","nation_i18n","tank_id"],g=[""],s=function(a){var i=u+a;return t.info("Searching for players: "+a),t.info(i),n.get(i).then(function(n){return n.data})},h=function(a){var i=c+a;return t.info("Searching for clans: "+a),t.info(i),n.get(i).then(function(n){return n.data})},_=function(a){var i=e+a;t.info("Getting tanks info for player "+a),t.info(i);var o=null;return n.get(i).then(function(n){return n.data})},k=function(a){var i=f+a;t.info("Getting tanks info for player "+a),t.info(i);var o=null;return n.get(i).then(function(n){return n.data})},w=function(a){var o=i+a;t.info("Getting player "+a+" information..."),t.info(o);var r=null;return n.get(o).then(function(n){return n.data})},v=function(a){var o=i+a+G(l);t.info("Getting language info for player "+a+" information..."),t.info(o);var r=null;return n.get(o).then(function(n){return n.data})},y=function(a){var i=o+a;return t.info("Getting clan "+a+" information..."),t.info(i),n.get(i).then(function(n){return n.data})},m=function(a){var i=r+a+G(d);return t.info("Getting tank "+a+" information..."),t.info(i),n.get(i).then(function(n){return n.data})},G=function(n){return"&fields="+n.join()};return{findPlayers:s,findClans:h,getPlayer:w,getClan:y,getTank:m,getPlayerLanguage:v,getPlayerTanks:_,getGarage:k}},t=angular.module("wotClanInfo");t.factory("wotSearch",n)}();