//Run on any twitch stream with chat enabled: http://www.twitch.tv/
var stream = 'twitch';

//remove other columns - keep chat open
var removeSideBar = true,
    removeMain = true;
if (document.querySelector('#left_col') && removeSideBar) {
    document.querySelector('#left_col').remove();
}
if (document.querySelector('#main_col') && removeMain) {
    document.querySelector('#main_col').remove();
}
//show chat even if small
if (document.querySelector('#left_col')) { document.getElementById("right_col").className = "";}

//css for viz
$("<style type='text/css'> .chart rect{stroke:#fff;fill:#4682b4}.axis{font:10px sans-serif}.axis line,.axis path{fill:none;stroke:#000;shape-rendering:crispEdges}.x.axis path{display:none}</style>").appendTo("head");

var keysNDS = ['a', 'b', 'left', 'right', 'up', 'down', 'x', 'y', 'select'];
var anarchy = true;

(function (d, script) {
    script = d.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.onload = function () {
        (function (d, script) {
            script = d.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.onload = function () {
                (function (d, script) {
                    script = d.createElement('script');
                    script.type = 'text/javascript';
                    script.async = true;
                    script.onload = function () {
                        // remote script has loaded
                        var socket = io.connect('http://localhost:8000');

                        var MyMutationTest = (function () {
                            //create obj
                            var mod = {};
                            mod.resetCount = function () {
                                return [
                                        {'lab': 'u', key: 'up', n: 0 },
                                        {'lab': 'd', key: 'down', n: 0 },
                                        {'lab': 'l', key: 'left', n: 0 },
                                        {'lab': 'r', key: 'right', n: 0 },
                                        {'lab': 'a', key: 'a', n: 0 },
                                        {'lab': 'b', key: 'b', n: 0 },
                                        {'lab': 'x', key: 'x', n: 0 },
                                        {'lab': 'y', key: 'y', n: 0 },
                                        {'lab': 'sel', key: 'select', n: 0}
                                ];
                            }
                            //key array
                            mod.keys = mod.resetCount();
                            mod.numKeys = 0;
                            mod.lastTime = new Date().getTime();
                            //last
                            mod.last = 0;
                            //if you want to log to your browser console
                            mod.logToConsole = false;
                            //twitch chat ul
                            if (stream == 'twitch') {
                                mod.target = document.querySelector('#chat_line_list');
                            } else if (stream == 'youtube') {
                                mod.target = document.querySelector('#all-comments');
                            }
                            // configuration of the observer:
                            mod.config = {
                                subtree: true,
                                childList: true
                            };
                            //function to start observing
                            mod.observe = function () {
                                // pass in the target node, as well as the observer options
                                mod.observer.observe(mod.target, mod.config);
                            };
                            //get last message
                            mod.mutLog = function (mutations) {
                                var lastChatMessage, current;
                                // console.log(mutations);

                                lastChatMessage = mutations[0].target.lastChild;
                                if (stream == 'twitch') {
                                    current = lastChatMessage.textContent.replace(/[\u00BB]/g, '').trim(); //ff
                                    // console.log(current);
                                    var content = current.split(':');
                                    if (content.length === 2) {
                                        user = content[0];
                                        input = content[1];
                                    } else {
                                        input = content[0];
                                    }
                                } else if (stream == 'youtube') {
                                    user = lastChatMessage.children[2].children[0].textContent.trim();
                                    input = lastChatMessage.children[2].children[1].textContent.trim();
                                    current = user + ": " + input;
                                }

                                //get rid of new line/spaces, remove name
                                var key = input.toLowerCase().trim();

                                if (key === 'u') {
                                    key = 'up'
                                } else if (key === 'd') {
                                    key = 'down'
                                } else if (key === 'l') {
                                    key = 'left'
                                } else if (key === 'r') {
                                    key = 'right'
                                }

                                //trivial way
                                if (anarchy) {
                                  socket.emit('i', { i: key });
                                }

                                //count
                                if (_.contains(keysNDS, key)) {
                                    mod.numKeys++;
                                    _.find(mod.keys, function (obj) {
                                        return obj.key === key;
                                    }).n++;
                                    // console.log(mod.keys[0].n,mod.keys[1].n,mod.keys[2].n,mod.keys[3].n,mod.keys[4].n,mod.keys[5].n,mod.keys[6].n);

                                }
                            };
                            // create an observer instance
                            mod.observer = new MutationObserver(mod.mutLog);

                            //number of seconds
                            var tallyTime = 1;

                            var count = 0;
                            var timer = 1;
                            var run = setInterval(function () {
                                redraw(mod.keys);
                                // avoid memory leak when in background tab
                                d3.timer.flush();
                                if (anarchy !== true) {
                                  if (count > tallyTime - 1) {
                                      if (mod.numKeys != 0) {
                                          var highestKey = _.sortBy(mod.keys, function (obj) {
                                              return obj.n * -1;
                                          })[0].key;
                                          socket.emit('i', {
                                              i: highestKey
                                          });
                                          d3.select(".last-key").html('Last Key: ' + highestKey);
                                          mod.keys = mod.resetCount();
                                          mod.numKeys = 0;
                                      } else {
                                          // auto press a if no inputs
                                          // socket.emit('i', { i: 'a' });
                                          // d3.select(".last-key").html('Last Key: ' + 'a by default');
                                      }
                                      count = 0;
                                  } else {
                                      count++;
                                  }
                                  d3.select(".time").html('Sec Left: ' + (tallyTime - count) + 's');
                                } else {
                                  if (timer > 60) {
                                    mod.keys = mod.resetCount();
                                    timer = 1;
                                  } else {
                                    timer++;
                                  }
                                }
                            }, 1000);

                            var query = ".app-main";

                            var w = 20,
                                h = 80,
                                width = w * mod.keys.length - 1;
                            height = h;

                            var x = d3.scale.linear()
                                .domain([0, mod.keys.length])
                                .range([0, w * mod.keys.length - 1]);

                            var y = d3.scale.linear()
                                .domain([0, d3.max(mod.keys, function (d) {
                                    return d.n;
                                })])
                                .rangeRound([0, h]);

                            var chart3 = d3.select(query).append("svg")
                                .attr("class", "chart")
                                .attr("width", w * mod.keys.length - 1)
                                .attr("height", h + 16);

                            chart3.append("line")
                                .attr("x1", 0)
                                .attr("x2", w * mod.keys.length)
                                .attr("y1", h - 0.5)
                                .attr("y2", h - 0.5)
                                .style("stroke", "#000");

                            chart3.append("g").selectAll("text")
                                .data(mod.keys).enter()
                                .append("text")
                                .text(function (d) {
                                    return d.lab;
                                })
                                .attr("x", function (d, i) {
                                    return x(i) + (w / 2) - 2;
                                })
                                .attr("y", function (d) {
                                    return h - y(d.n) + 12;
                                });

                            d3.select(".app-main")
                                .append('div')
                                .attr('class', 'time');

                            d3.select(".app-main")
                                .append('div')
                                .attr('class', 'last-key')
                                .html('Last Key: ');

                            function redraw(data) {
                                y = d3.scale.linear()
                                    .domain([0, d3.max(data, function (d) {
                                        return d.n;
                                    })])
                                    .rangeRound([0, h]);

                                var rect = chart3.selectAll("rect")
                                    .data(data);

                                rect.enter().insert("rect", "line")
                                    .attr("x", function (d, i) {
                                        return x(i);
                                    })
                                    .attr("y", h)
                                    .attr("width", w)
                                    .attr("height", function (d) {
                                        return y(d.n);
                                    })
                                    .transition()
                                    .duration(1000)
                                    .attr("y", function (d) {
                                        return h - y(d.n);
                                    });

                                var text = chart3.selectAll(".num").data(data);
                                text.enter().append("text")
                                    .text(function (d) {
                                        return d.n;
                                    })
                                    .attr("class", "num")
                                    .attr("x", function (d, i) {
                                        return x(i) + (w / 2) - 4;
                                    })
                                    .attr("font-family", "sans-serif")
                                    .attr("font-size", "11px")
                                    .attr("fill", "white");
                                rect.transition()
                                    .duration(function (d) {
                                        if (d.n === 0) {
                                            return 500;
                                        } else {
                                            return 1000;
                                        }
                                    })
                                    .attr("y", function (d, i) {
                                        return h - y(d.n);
                                    })
                                    .attr("height", function (d) {
                                        return y(d.n);
                                    });
                                text.transition()
                                    .duration(function (d) {
                                        if (d.n === 0) {
                                            return 500;
                                        } else {
                                            return 1000;
                                        }
                                    })
                                    .attr("y", function (d, i) {
                                        if (d.n === 0) {
                                            return h - 1;
                                        } else {
                                            return h - y(d.n) + 14;
                                        }
                                    })
                                    .text(function (d) {
                                        return d.n;
                                    });
                            }

                            return mod;
                        }()).observe();
                    };
                    script.src = 'http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.1/d3.min.js';
                    d.getElementsByTagName('head')[0].appendChild(script);
                }(document));
            };
            script.src = 'http://underscorejs.org/underscore-min.js';
            d.getElementsByTagName('head')[0].appendChild(script);
        }(document));
    };
    script.src = 'http://localhost:8000/socket.io/socket.io.js';
    d.getElementsByTagName('head')[0].appendChild(script);
}(document));