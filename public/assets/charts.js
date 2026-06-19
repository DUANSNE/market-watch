// assets/charts.js
(function() {
  var D = window.DAT || [];
  if (!D.length) { console.error('No data loaded'); return; }

  function byId(id) { return D.find(function(x) { return x.id === id; }); }
  function fmt(n) { if (n == null) return '--'; var s = n.toFixed(2); return n >= 0 ? '+' + s : s; }
  function fmtP(n) { if (n == null) return '--'; var s = n.toFixed(2); return n >= 0 ? '+' + s + '%' : s + '%'; }
  function fmtUSD(n) {
    if (n == null) return '--';
    if (Math.abs(n) >= 1000) return '$' + n.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2});
    return '$' + n.toFixed(2);
  }
  function tag(p) {
    if (p == null) return '';
    var cls = p >= 0 ? 'tag tag-up' : 'tag tag-dn';
    return '<span class="' + cls + '">' + (p >= 0 ? '+' : '') + p.toFixed(2) + '%</span>';
  }

  /* ── Tab switching ── */
  document.querySelectorAll('[data-tab]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('[data-tab]').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
      a.classList.add('active');
      document.getElementById(a.dataset.tab).classList.add('active');
      // refresh charts on switch
      if (a.dataset.tab === 'bonds') { setTimeout(function() { buildCharts(); }, 100); }
    });
  });

  /* ── Render tables ── */
  // Bonds - US Treasury
  var usRows = D.filter(function(x) { return x.id.startsWith('us'); });
  var usHtml = '';
  usRows.forEach(function(r) {
    usHtml += '<tr><td class="b">' + r.n + '</td><td class="m">' + r.c + '</td><td class="nr b">' +
      r.p.toFixed(2) + '%</td><td class="nr ' + (r.chg >= 0 ? '' : 'm') + '">' + fmt(r.chg) + '%</td>' +
      '<td class="nr">' + tag(r.chgP) + '</td><td class="nr m">' + r.t + '</td></tr>';
  });
  document.getElementById('us-tbody').innerHTML = usHtml;

  // Bonds - Global
  var glRows = D.filter(function(x) { return !x.id.startsWith('us') && ['china-bond','intl-treas','em-bonds'].includes(x.id); });
  var glHtml = '';
  glRows.forEach(function(r) {
    glHtml += '<tr><td class="b">' + r.n + '</td><td class="m">' + r.c + '</td><td class="nr b">' +
      fmtUSD(r.p) + '</td><td class="nr ' + (r.chg >= 0 ? '' : 'm') + '">' + fmt(r.chg) + '</td>' +
      '<td class="nr">' + tag(r.chgP) + '</td><td class="nr m">' + r.t + '</td></tr>';
  });
  document.getElementById('gl-tbody').innerHTML = glHtml;

  document.getElementById('bonds-ts').textContent = new Date().toLocaleString('zh-CN');
  document.getElementById('bonds-count').textContent = (usRows.length + glRows.length);

  // Evening - tables
  function makeRows(ids, cols) {
    return ids.map(byId).filter(Boolean).map(function(r) {
      var extra = cols ? '' : '<td class="m">' + r.t + '</td>';
      return '<tr><td class="b">' + r.n + '</td><td class="m">' + r.c + '</td>' +
        '<td class="nr b">' + fmtUSD(r.p) + '</td><td class="nr">' + tag(r.chgP) + '</td>' + extra + '</tr>';
    }).join('');
  }
  document.getElementById('ai-tbody').innerHTML = makeRows(['sox','nvidia','apple','nasdaq']);
  document.getElementById('cmd-tbody').innerHTML = makeRows(['crude','gold','copper']);
  document.getElementById('mac-tbody').innerHTML = makeRows(['dxy','us10y','vix']);

  var glbIds = ['sp500','nasdaq','nikkei','hang-seng','shanghai','euro-stoxx','ftse100','dax'];
  var glbHtml = '';
  glbIds.forEach(function(id) {
    var r = byId(id); if (!r) return;
    glbHtml += '<tr><td class="m">' + r.m + '</td><td class="b">' + r.n + '</td><td class="nr b">' +
      fmtUSD(r.p) + '</td><td class="nr">' + tag(r.chgP) + '</td></tr>';
  });
  document.getElementById('glb-tbody').innerHTML = glbHtml;

  document.getElementById('ev-ts').textContent = new Date().toLocaleString('zh-CN');
  var up = D.filter(function(x) { return x.chgP > 0; }).length;
  var dn = D.filter(function(x) { return x.chgP < 0; }).length;
  document.getElementById('ev-kpis').innerHTML =
    '<div class="kpi"><div class="v">' + D.length + '</div><div class="l">追踪标的</div></div>' +
    '<div class="kpi"><div class="v up">' + up + '</div><div class="l">上涨</div></div>' +
    '<div class="kpi"><div class="v dn">' + dn + '</div><div class="l">下跌</div></div>';

  // Masters
  var mastersHtml = [
    {
      name: 'Michael Hartnett', org: 'Bank of America · 首席投资策略师',
      views: [
        ['AI 泡沫论', '当前 AI 驱动的市场是<strong>"自 1880 年代铁路泡沫以来最大的泡沫"</strong>，市场集中度接近 48%，仅 21 只股票在创新高。'],
        ['交易策略', '做多<strong>商品、卖出美元、消费股逆向多头</strong>。虽触发卖出信号但不要急于离场——等待美联储转鹰或信用条件收紧。'],
        ['宏观框架', '美国经济处于<strong>"Boom Loop"</strong>。<strong>"这十年就是关于供给"</strong>。核心风险：债券收益率上行。']
      ],
      src: ['AI 铁路泡沫论', '做多商品/做空美元', '泡沫后投资手册', '卖出信号解析', 'Boom Loop'],
      judge: '泡沫论信号价值高，但每次喊泡沫未必立即可见顶。看多商品/看空美元（供给约束、去美元化）比泡沫论更自洽。当前"高胜率低赔率"。'
    },
    {
      name: 'Ray Dalio', org: 'Bridgewater Associates · 创始人',
      views: [
        ['2026–2028 危险窗口', '美国债务 <strong>$39.2 万亿</strong>，年利息即将突破 <strong>$1 万亿</strong>。财政已"越过不归点"。支出 $7.1 万亿 vs 收入 $5.3 万亿。'],
        ['资本战争与黄金', '建议组合 <strong>10–15% 配置黄金</strong>。2025 年黄金回报 65%，跑赢标普 47 个百分点。80% 的世界货币在历史上已消失。'],
        ['五大力量', '债务/货币恶化 · 政治撕裂 · 中美技术冷战 · AI 革命。科技战争赢家将"赢得所有战争"。']
      ],
      src: ['大周期与债务危机', '资本战争与黄金', '两年内大问题', 'HBR 访谈', 'Bridgewater'],
      judge: '$39 万亿债务是事实，但时点预测不够精确。VIX ~16、信用利差窄说明市场未定价灾难场景。适合做结构仓位参考，不适合做择时工具。'
    },
    {
      name: 'Howard Marks', org: 'Oaktree Capital · 联合创始人',
      views: [
        ['AI 估值判断', '备忘录 <em>AI Hurtles Ahead</em>：AI 是真实技术革命，但部分收入是<strong>"循环收入"</strong>——AI 公司相互购买服务。<strong>"不要 all-in"</strong>。'],
        ['私人信贷警告', '最新备忘录对<strong>直接借贷市场</strong>发出警告——该行业正面临 2008 年以来首次大考。Oaktree 已主动减少相关敞口。'],
        ['历史哲学', '把 AI 类比 1860 年代铁路大繁荣。<strong>"泡沫并非由技术直接导致，而是过度乐观应用于技术"</strong>。']
      ],
      src: ['AI Hurtles Ahead', '私人信贷备忘录', 'Is It a Bubble?', 'Oaktree 研究'],
      judge: '三者中最"中间派"。私人信贷警告最值得重视——该市场与 PE 杠杆深度绑定，Oaktree 主动减仓的行为信号比言辞更有分量。'
    }
  ].map(function(m) {
    var vt = m.views.map(function(v) {
      return '<div class="vt"><h4>' + v[0] + '</h4><p>' + v[1] + '</p></div>';
    }).join('');
    var src = '<div class="src">' + m.src.map(function(s) { return '<span>' + s + ' ↗</span>'; }).join('') + '</div>';
    return '<div class="master"><h3>' + m.name + '</h3><p class="org">' + m.org + '</p>' +
      vt + src + '<p class="judge"><em>⚖ 判断：</em>' + m.judge + '</p></div>';
  }).join('');
  document.getElementById('masters').innerHTML = mastersHtml;

  // Insights (simple fallback - real insights would come from server)
  document.getElementById('insights').innerHTML =
    '<div class="insight"><div class="ih"><h4>今日盘面总结</h4><span class="conf">中</span></div>' +
    '<p>综合价格、利率、信用数据，判断全球资金今天在追逐确定性增长（AI），还是在押注再通胀与补库（大宗），抑或进入全面避险。</p></div>' +
    '<div class="insight"><div class="ih"><h4>反方提醒</h4></div>' +
    '<p>市场最一致的方向往往也是最大的反脆弱性来源。通过利率、信用利差和相关资产验证来检查叙事是否过热。</p></div>';

  /* ── ECharts ── */
  var usYieldIds = ['us10y','us30y','us5y','us3m'];
  var etfIds     = ['china-bond','intl-treas','em-bonds'];

  var usLog = false;
  var glLog = true;

  function makeChart(elId, ids, isLog, norm) {
    var el = document.getElementById(elId);
    if (!el) return null;
    var ch = echarts.init(el, null, { renderer: 'svg' });

    var series = [];
    var legends = [];

    ids.forEach(function(id) {
      var item = byId(id);
      if (!item || !item.hist || item.hist.length < 5) return;

      var data;
      if (norm) {
        var base = item.hist[0].c;
        data = item.hist.map(function(p) { return [p.t, base > 0 ? (p.c / base) * 100 : 100]; });
      } else {
        data = item.hist.map(function(p) { return [p.t, p.c]; });
      }

      series.push({ name: item.n, type: 'line', data: data, smooth: true, symbol: 'none' });
      legends.push(item.n);
    });

    ch.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis', appendToBody: true,
        backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#e2e8f0', borderWidth: 1,
        textStyle: { color: '#334155', fontSize: 12 },
        formatter: function(params) {
          if (!Array.isArray(params) || !params[0]) return '';
          var d = new Date(params[0].data[0]);
          var ds = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
          var h = '<div style="font-size:12px;font-weight:600;margin-bottom:4px;color:#1e293b">' + ds + '</div>';
          params.forEach(function(p) {
            var v = norm ? (p.data[1] - 100).toFixed(2) + '%' : p.data[1].toFixed(2) + '%';
            h += '<div style="display:flex;justify-content:space-between;gap:20px;padding:1px 0">' +
              '<span style="color:' + p.color + ';display:flex;align-items:center;gap:4px">' +
              '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + p.color + '"></span>' +
              p.seriesName + '</span><span style="font-weight:600;color:#1e293b">' + v + '</span></div>';
          });
          return h;
        }
      },
      legend: { data: legends, bottom: 0, type: 'scroll', textStyle: { fontSize: 11 } },
      grid: { left: 54, right: 18, top: 16, bottom: 44 },
      xAxis: { type: 'time', axisLabel: { fontSize: 10 } },
      yAxis: {
        type: isLog ? 'log' : 'value',
        axisLabel: {
          fontSize: 10,
          formatter: function(v) { return norm ? (v - 100).toFixed(0) + '%' : v.toFixed(1) + '%'; }
        },
        splitLine: { lineStyle: { type: 'dashed' } }
      },
      dataZoom: [{ type: 'inside', start: 20, end: 100 }, { type: 'slider', bottom: 26, height: 10 }],
      series: series
    }, true);

    window.addEventListener('resize', function() { ch.resize(); });
    return {
      chart: ch,
      setLog: function(v) {
        isLog = v;
        ch.setOption({
          yAxis: {
            type: v ? 'log' : 'value',
            axisLabel: {
              formatter: function(val) { return norm ? (val - 100).toFixed(0) + '%' : val.toFixed(1) + '%'; }
            }
          }
        });
      }
    };
  }

  var usChart, glChart;

  function buildCharts() {
    usChart = makeChart('ch-us', usYieldIds, usLog, false);
    glChart = makeChart('ch-gl', etfIds, glLog, true);
  }

  document.getElementById('btn-us-log').addEventListener('click', function() {
    usLog = !usLog;
    this.textContent = usLog ? '切换线性坐标' : '切换对数坐标';
    if (usChart) usChart.setLog(usLog);
    else buildCharts();
  });
  document.getElementById('btn-gl-log').addEventListener('click', function() {
    glLog = !glLog;
    this.textContent = glLog ? '切换线性坐标' : '切换对数坐标';
    if (glChart) glChart.setLog(glLog);
    else buildCharts();
  });

  // Init charts
  setTimeout(buildCharts, 200);
})();
