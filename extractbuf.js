/**
 * Created by pricope on 9/9/2015.
 */

var fs = require('fs')
var cheerio = require('cheerio')
var http = require('q-io/http');
var FS = require("q-io/fs");
var extend = require('node.extend');

var Q = require('q');


function getHeroes() {
  var reqObj = {
    url: 'http://www.dotabuff.com/heroes/medusa/matchups',
    method: 'GET',
    headers: {
      'Cookie': 'OX_plg=swf|wmp|shk|pm; __gads=ID=1a23941719173056:T=1423295676:S=ALNI_Mb6ef5FISBEXQMQbzolK2yjT4EDUA; __qca=P0-1161482836-1423295679715; _player_token=42593d05dd7dce124a85b852e722be32b43fcd4bffb232e9f63856e49ba750de; _tz=Europe%2FBerlin; _s=NnFCV0VOY1J2UWFwd0xiUnluWDI0Y0Y5TE53NG9mTVBvdHpkSmMrNzd4d3JIWjRLb3dvVGozTE5nZEFYeVRiRWN4SnF0UnJTMEpYT29sM2pKTERwSlB0Zy9KclhEVHVQRVhhczVyS2hvL1BHMjgvNmdZSXNnc1RnSVVEVVJGMlB6djRPNmFPUktWbjVOR09TalYzZHd3NVRvcTJDYnkwVGpjTmNEWDloU3NNN3o3OU8zZ1MxYUo4bXNGNTRTV0lvLS1GRWxnRWo1YjRBL1dEaER2YU5wKzlBPT0%3D--8ebf809a48f991f8a5e551d011661e7adfbfd47e; __utma=242922391.284722289.1423295675.1441783045.1441791130.469; __utmb=242922391.2.10.1441791130; __utmc=242922391; __utmz=242922391.1437934609.331.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
      'User-Agent': ' Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36'
    }
  };
  return http.request(reqObj).then(function (res) {
    return res.body.read().then(function (payload) {
      var heroes = [];
      $1 = cheerio.load(payload);
      heroes.push('medusa');
      $1("section").find('tr[data-link-to*="/heroes"]').each(function (i, el) {
        heroes.push(el.attribs['data-link-to'].split('/')[2]);
      });
      return heroes;
    });
  }).catch(function (e) {
    console.log(e)
  });


}


function getHeroStats(hero) {
  var reqObj = {
    url: 'http://www.dotabuff.com/heroes/' + hero + '/matchups?date=patch_6.86c',
    method: 'GET',
    headers: {
      'Cookie': 'OX_plg=swf|wmp|shk|pm; __gads=ID=1a23941719173056:T=1423295676:S=ALNI_Mb6ef5FISBEXQMQbzolK2yjT4EDUA; __qca=P0-1161482836-1423295679715; _player_token=42593d05dd7dce124a85b852e722be32b43fcd4bffb232e9f63856e49ba750de; _tz=Europe%2FBerlin; _s=NnFCV0VOY1J2UWFwd0xiUnluWDI0Y0Y5TE53NG9mTVBvdHpkSmMrNzd4d3JIWjRLb3dvVGozTE5nZEFYeVRiRWN4SnF0UnJTMEpYT29sM2pKTERwSlB0Zy9KclhEVHVQRVhhczVyS2hvL1BHMjgvNmdZSXNnc1RnSVVEVVJGMlB6djRPNmFPUktWbjVOR09TalYzZHd3NVRvcTJDYnkwVGpjTmNEWDloU3NNN3o3OU8zZ1MxYUo4bXNGNTRTV0lvLS1GRWxnRWo1YjRBL1dEaER2YU5wKzlBPT0%3D--8ebf809a48f991f8a5e551d011661e7adfbfd47e; __utma=242922391.284722289.1423295675.1441783045.1441791130.469; __utmb=242922391.2.10.1441791130; __utmc=242922391; __utmz=242922391.1437934609.331.3.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)',
      'User-Agent': ' Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36'
    }
  };
  return http.request(reqObj).then(function (res) {
    return res.body.read().then(function (payload) {
      var heroes = {};
      $1 = cheerio.load(payload);
      $1("section").find('tr[data-link-to*="/heroes"]').each(function (i, el) {
        //heroes.push(el);
        var score = el.children[2].attribs['data-value'];
        var opHero = el.attribs['data-link-to'].split('/')[2];
        heroes[opHero] = score;
      });
      return heroes;
    });
  }).catch(function (e) {
    console.log(e)
  });


}


//getHeroStats('medusa').then(function (heroes) {
//  console.log(heroes);
//});

function delayWalk(arr, callback, endcall) {
  var next = arr.shift();
  if (next === undefined) {
    endcall();
  } else {
    console.log(arr.length);
    setTimeout(function (nxt) {
      callback(nxt);
      delayWalk(arr, callback, endcall);
    }, 1000, next);


  }
}


function getAllHeroStats(heroes) {

  var def = Q.defer();
  var allp = [];
  delayWalk(heroes, function (hero) {
    allp.push(getHeroStats(hero).then(function (stats) {
      console.log(hero);
      var ret = {};
      ret[hero] = stats;
      return ret;
    }));
  }, function () {
    def.resolve(Q.all(allp));
  });


  return def.promise;

}



function mergeStats(stats, selectedHeroes) {
  var merged = {};
  var iHero = selectedHeroes.shift();
  merged = stats[iHero];
  selectedHeroes.forEach(function (hero) {

    //console.log(hero);
    delete merged[hero];
    for (var k in merged) {
      merged[k] = parseFloat(merged[k]) + parseFloat(stats[hero][k]);
    }
  });

  return merged;
}

function displayTop(stats, top) {
  var arr = [];
  for (k in stats) {
    arr.push({hero: k, stat: stats[k]});

  }

  arr.sort(function (a, b) {
    return a.stat - b.stat;
  });

  console.log(arr.slice(0, top));
}


function condense(all, some) {
  var condensed = [];
  some.forEach(function (el) {
    if (el == "io") {
      condensed.push("io");
    } else {
      var tmp = all.filter(function (k, i, a) {
        if (k.indexOf(el) > -1) {
          return true;
        }
        return false;
      });
      condensed = condensed.concat(tmp);
    }
  });
  if (condensed.length != some.length) {
    console.log(condensed);
    throw new Error("Unable to Condense");
  }
  return condensed;
}


if (process.argv[2] == 'refresh') {
  getHeroes().then(function (heroes) {
    FS.write('buff/heroes.json', JSON.stringify(heroes)).then(function () {
      FS.read('buff/heroes.json').then(function (heroData) {
        var heroes = JSON.parse(heroData);
        getAllHeroStats(heroes).then(function (result) {
          var final = {};
          result.forEach(function (el) {
            final = extend(final, el);
          });
          FS.write('buff/heroesStats.json', JSON.stringify(final));
        });
      }).catch(function (e) {
        console.log(e);
      });

    });
  });


} else {
  FS.read('buff/heroes.json').then(function (heroData) {
    var heroes = JSON.parse(heroData);
    FS.read('buff/heroesStats.json').then(function (heroData) {
      var heroesStats = JSON.parse(heroData);
      var uncond = process.argv.slice(2);
      var cond = condense(heroes, uncond);
      var merged = mergeStats(heroesStats, cond);
      displayTop(merged, 25);
    });
  }).catch(function (e) {
    console.log(e);
  });

}

