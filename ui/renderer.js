const { ipcRenderer, shell } = require('electron');

// --- Global State ---
let skinViewer = null;

const translations = {
    en: {
        targetLabel: 'Current Target',
        userLabel: 'User',
        waiting: 'Waiting...',
        pluginsTitle: 'Active Plugins',
        resourcesTitle: 'Guess you want to use',
        settingsTitle: 'Settings Center',
        systemReady: 'System Ready.',
        langBtn: 'EN',
        restartRequired: '⚠ Restart Required',
        newPluginDesc: 'New plugin detected.',
        modalTitle: 'Switch Server',
        savedServers: 'Saved Servers',
        customIp: 'Custom IP Address',
        btnReturn: 'Return',
        btnSave: 'Save',
        configTitle: 'Plugin Configuration',
        btnCancel: 'Cancel',
        saveConfig: 'Save Config',
        loadConfigFail: 'Failed to load configuration.',
        saveConfigSuccess: 'Configuration saved!',
        saveConfigFail: 'Failed to save configuration.',
        btnConsole: 'Console Log',
        btnRestart: 'Restart Proxy',
        restartConfirm: 'Are you sure you want to restart the proxy? This will reload all plugins.',
        themeTitle: 'Visual Theme',
        themeStarry: 'Starry',
        themeNord: 'Nord',
        themeCyberpunk: 'Cyberpunk',
        themeAcrylic: 'Acrylic',
        themeFrosted: 'Frosted',
        themeStarry: 'Starry',
        themeNord: 'Nord',
        themeCyberpunk: 'Cyberpunk',
        themeAcrylic: 'Acrylic',
        themeFrosted: 'Frosted',
        serverTime: 'Beijing Time',
        quoteTitle: 'Inexplicable Quotes',
        nextQuote: 'Next Quote',
        quickCmdTitle: 'Quick Commands',
        // --- New Translations ---
        optimizeTitle: 'Network Optimization',
        optimizeDesc: 'Optimize registry & TCP settings for lower ping.',
        btnOptimize: 'Run Optimizer (Admin)',
        optSuccess: 'Optimization tool launched successfully!',
        optFail: 'Failed to launch tool: '
    },
    zh: {
        targetLabel: '当前服务器',
        userLabel: '当前用户',
        waiting: '等待连接...',
        pluginsTitle: '已加载插件',
        resourcesTitle: '猜你想用',
        settingsTitle: '设置中心',
        systemReady: '系统就绪',
        langBtn: '中文',
        restartRequired: '⚠ 需要重启以加载',
        newPluginDesc: '检测到新插件文件。',
        modalTitle: '切换服务器',
        savedServers: '已存服务器',
        customIp: '自定义 IP 地址',
        btnReturn: '返回',
        btnSave: '保存',
        configTitle: '插件配置',
        btnCancel: '取消',
        saveConfig: '保存配置',
        loadConfigFail: '加载插件配置失败。',
        saveConfigSuccess: '配置已保存！',
        saveConfigFail: '保存配置失败。',
        btnConsole: '显示/隐藏 控制台',
        btnRestart: '重启代理',
        restartConfirm: '确定要重启代理吗？这将重新加载所有插件。',
        themeTitle: '界面主题',
        themeStarry: '星空 (默认)',
        themeNord: '北极光',
        themeCyberpunk: '赛博朋克',
        themeAcrylic: '亚克力板',
        themeFrosted: '毛玻璃',
        serverTime: '北京时间',
        quoteTitle: '莫名其妙语录',
        nextQuote: '换一句',
        quickCmdTitle: '快捷指令',
        // --- New Translations ---
        optimizeTitle: '网络优化',
        optimizeDesc: '优化注册表与TCP设置以降低延迟。',
        btnOptimize: '执行优化 (管理员)',
        optSuccess: '优化工具已启动！请在弹出的窗口中操作。',
        optFail: '启动失败: '
    }
};

let currentLang = 'zh';

const webResources = [
    { name: 'Vape', url: 'https://vape.gg' },
    { name: 'Drip', url: 'https://neverlack.in' },
    { name: 'Liquidbounce', url: 'https://liquidbounce.net' },
    { name: 'Rise', url: 'https://riseclient.com' },
    { name: 'Opai', url: 'https://opai.today' }
];

const quotes = [
    "写代码就像写诗，只是经常编译不过。",
    "今天是个好日子，适合修Bug。",
    "你的电脑除了你，没人能懂。",
    "重启能解决99%的问题，剩下的1%重装系统。",
    "我不是在摸鱼，我是在思考架构。",
    "Talk is cheap, show me the code.",
    "世界上只有10种人：懂二进制的和不懂的。",
    "程序在我和上帝之间，只有上帝知道它是怎么跑起来的。",
    "键盘敲烂，月薪过万。",
    "优化是万恶之源，先跑起来再说。",
    "404 Not Found: 你的梦想未找到。",
    "Ctrl+C, Ctrl+V 是程序员最高效的技能。",
    "我在代码里下了毒，删了它整个项目都会崩。",
    "我的代码没有Bug，那叫随机特性（Feature）。",
    "只要我不看控制台，报错就不存在。",
    "在我机器上明明是好的，你换个运势试试。",
    "产品经理的嘴，骗人的鬼。",
    "这个时候，我们通常建议把用户杀掉（kill user）。",
    "代码和人，有一个能跑就行。",
    "在这个公司，我是靠重启服务器混到现在的。",
    "虽然我这行代码写的是错的，但它运行起来是对的，这就叫玄学。",
    "不要问我为什么，我删了一行注释，程序就崩了。",
    "程序员最讨厌的两件事：写文档，别人不写文档。",
    "我的发际线，是我资历的证明。",
    "如果你觉得我的代码烂，你应该看看我上一任留下的。",
    "警告（Warning）不是报错，只要不红就是晴天。",
    "周五不发布，发布就跑路。",
    "正在与屎山代码进行亲切友好的物理交流。",
    "面向工资编程，面向监狱维护。",
    "我的键盘F5键已经磨没了。",
    "这是一个已知问题，我们决定不解决它。",
    "不管你信不信，这代码昨天还是能跑的。",
    "一定是缓存的问题，清理缓存试试？",
    "正在假装写代码，其实在看黑底白字的电子书。",
    "这行代码能跑，但我不知道为什么，所以别动它。",
    "没有什么是一顿烧烤解决不了的，除了死锁。",
    "我是一个没有感情的API调用机器。",
    "需求变更就像龙卷风，来得太快就像龙卷风。",
    "我在代码里埋了一个彩蛋，希望能炸死接盘侠。",
    "这个Bug不是我写的，是Git合并时变异产生的。",
    "现在的年轻人，连Hello World都写不对。",
    "与其优化代码，不如优化简历。",
    "PHP是世界上最好的语言（如果不服，请憋着）。",
    "键盘越粉，骂人越狠。",
    "注释是不可能写的，这辈子都不可能写的。",
    "不仅要能写代码，还要能修电脑，通下水道，搬桌子。",
    "我离当场去世，就差一个空指针异常。",
    "你现在的气质，里藏着你敲过的代码和改过的Bug。",
    "即使再小的帆也能远航，即使再烂的代码也能上线。",
    "人生就像无限循环，找不到出口（break）。",
    "对象（Object）好找，对象（Girlfriend）难找。",
    "一入IT深似海，从此头发是路人。",
    "我写的不是代码，是这一地鸡毛的生活。",
    "不要跟我谈理想，我的理想是不上班。",
    "这哪是代码，这简直是加密通话。",
    "为了防止我离职，公司决定把代码写得只有我能看懂。",
    "与其试图理解这段代码，不如重写。",
    "程序崩溃的那一刻，我的心也碎了。",
    "这个需求做不了，技术实现有瓶颈（其实是我不想做）。",
    "改Bug就像拆弹，剪红线还是蓝线，全看运气。",
    "如果建筑师像程序员写代码一样盖楼，第一只到来的啄木鸟就能毁灭文明。",
    "熬最晚的夜，敷最贵的面膜，写最烂的代码。",
    "世界上最远的距离，是我在if里，你在else里。",
    "这段代码采用了先进的“复制粘贴”设计模式。",
    "不要用你的业余爱好，挑战我吃饭的本事（虽然我也不太会）。",
    "我在测试环境是一条龙，在生产环境是一条虫。",
    "上线就像生孩子，顺产是运气，难产是常态。",
    "别跟我说下班，服务器还没关机呢。",
    "我的生活规律：吃饭、睡觉、写Bug。",
    "没有什么比还没保存代码电脑就蓝屏更绝望的了。",
    "程序员的三大幻觉：这个很简单、这个能做完、这个没Bug。",
    "我在等风来，也在等编译通过。",
    "如果调试是清除Bug的过程，那编程一定是制造Bug的过程。",
    "这段逻辑太复杂，我建议交给AI去想。",
    "我现在的精神状态：400 Bad Request。",
    "谁动了我的显示器分辨率？",
    "每天叫醒我的不是梦想，是运维的电话。",
    "我的代码风格：狂野派。",
    "这个变量名命名为 'aaaa' 是有深意的。",
    "删库跑路，是每个程序员最后的尊严。",
    "别催了，正在Stack Overflow上抄呢。",
    "如果代码能跑，就不要去升级库。",
    "程序员的浪漫：sudo rm -rf /",
    "自从学了编程，看谁都像个对象。",
    "我的大脑内存溢出了。",
    "生活不仅有眼前的苟且，还有读不懂的文档。",
    "正在进行垃圾回收（Garbage Collection）...",
    "这个项目能跑起来，全靠运气和我的发量。",
    "我怀疑编译器在针对我。",
    "键盘敲得响，工资涨得快。",
    "不要轻易尝试递归，不要轻易尝试递归。",
    "看着自己写的代码，感叹：这谁写的垃圾？哦，是我。",
    "一切看起来都正常，这才是最不正常的。",
    "我是一个全栈工程师：全都没栈到。",
    "正在尝试与服务器进行心灵感应。",
    "TCP连接已断开，就像我们的爱情。",
    "请不要在星期五下午5点提交代码。",
    "我的代码很完美，直到测试介入。",
    "这不是Bug，这是未被发现的彩蛋。",
    "真正的程序员，直接在二进制下编程。",
    "听说你会修电脑？那你帮我看看洗衣机怎么坏了。",
    "代码写得乱，说明思维发散，是创新的表现。",
    "把大象装进冰箱需要几步？程序员：一步，调用 putElephant()。",
    "正在加载我的耐心... 加载失败。",
    "生活就像布尔值，非黑即白？不，是null。",
    "这该死的缩进，逼死强迫症。",
    "为了省那几个字节的内存，我掉了几根头发。",
    "看到TODO注释，我就知道这里是个坑。",
    "程序员的这种“无能为力”，你们不懂。",
    "正在编译... 10% ... 99% ... 报错。",
    "人生没有Ctrl+Z，写错了只能重构。",
    "我不仅会C++，还会C--（视力下降）。",
    "这是一个临时的解决方案，虽然已经用了三年。",
    "客户说：只要微调一下。程序员卒。",
    "你的空格键声音太大了，吵到我写Bug了。",
    "这段代码能运行，上帝保佑。",
    "我是程序员，我不需要睡眠，我需要咖啡因。",
    "别碰我的键盘，这是我的法器。",
    "这个功能下个版本再做（无限延期）。",
    "我正在尝试用Python控制我的生活，但是库没装好。",
    "看到绿色的 'Build Success' 是我一天中最快乐的时刻。",
    "与其报错，不如沉默（try-catch-empty）。",
    "这个Bug太诡异了，我建议归类为灵异事件。",
    "不要相信用户输入，也不要相信产品经理的承诺。",
    "我的代码是艺术品，虽然是抽象派。",
    "正在执行 rm -rf /* ... 请稍候。",
    "你的需求很清晰，但我选择无视。",
    "代码重构？不，那是重写。",
    "我爱Linux，因为它是自由的，就像我的Bug一样。",
    "如果你看不懂这段代码，那是你的级别不够。",
    "正在寻找丢失的分号 ;",
    "这个功能很简单，我五分钟就能写完（实际上写了五天）。",
    "所有的Bug都是Feature的伏笔。",
    "我在代码里下了诅咒，谁改谁倒霉。",
    "生活充满了异常（Exception），我却忘了写Catch。",
    "程序员的快乐很简单：没有红色波浪线。",
    "正在从入门到放弃...",
    "我的代码不需要测试，用户就是最好的测试员。",
    "这个逻辑连我自己都绕晕了，更别说计算机了。",
    "不要问我原理，它能跑就行。",
    "我是来改变世界的，虽然现在还在改Bug。",
    "听说C++很难？没关系，反正我也学不会。",
    "Java是最好的... 算了，我不引战。",
    "正在假装我很忙，敲击速度 200字/分。",
    "我的电脑比我女朋友还热。",
    "别跟我提需求，伤钱。",
    "这行代码价值连城，删了公司就瘫痪。",
    "我写的不是代码，是寂寞。",
    "正在尝试连接火星服务器...",
    "所有的偶然都是必然，所有的Bug都是命中注定。",
    "这大概是编码格式的问题，换成UTF-8试试？",
    "重启电脑解决不了的问题，那就重启路由器。",
    "我在代码的海洋里溺水了。",
    "这个框架太烂了，我要自己造个轮子。",
    "轮子造好了，发现是方的。",
    "不要在注释里写笑话，代码本身就是笑话。",
    "我的IDE比我更懂代码。",
    "正在努力让代码看起来像是一个人写的。",
    "这不是死循环，这是无限的爱。",
    "你的智商余额不足，无法理解此段代码。",
    "正在把Bug变成Feature...",
    "我不需要文档，代码就是最好的文档（虽然我也不看）。",
    "正在和数据库进行殊死搏斗。",
    "这个错误码 500 是我此时的心情。",
    "我的代码很安全，因为没人能看懂怎么攻击。",
    "正在等待奇迹发生（Compiling...）。",
    "别问，问就是底层逻辑。",
    "这个需求不符合物理学定律。",
    "正在尝试用 CSS 垂直居中...",
    "我的代码在那个平行宇宙是完美的。",
    "不要试图去理解正则表达式。",
    "我是程序员，不是修打印机的。",
    "正在把 coffee 转换成 code。",
    "这个变量名是我脸滚键盘打出来的。",
    "生活就像 Git，一旦 Commit 就无法回头（除非 reset --hard）。",
    "正在寻找接盘侠...",
    "这个功能是留给实习生练手的。",
    "我的代码充满了魔术数字（Magic Numbers）。",
    "正在进行防御性编程：防止自己犯傻。",
    "这个 Bug 是祖传的，不能修。",
    "别动！这段代码有灵魂。",
    "我感觉我的颈椎在抗议。",
    "正在思考人生... NullPointerException。",
    "这个算法的时间复杂度是 O(我的寿命)。",
    "正在尝试暴力破解产品经理的脑回路。",
    "我的代码不仅占用内存，还占用我的心智。",
    "不要让程序员做设计，否则你会得到一个控制台界面。",
    "正在用记事本写代码，致敬大神。",
    "这个 Bug 复现不了，那就是没 Bug。",
    "正在把 Bug 藏在深处...",
    "我的代码非常整洁，因为我把没用的都删了。",
    "正在尝试用 Java 写前端...",
    "这个类已经被弃用了，但我还在用。",
    "我的代码像一座危楼，摇摇欲坠但就是不倒。",
    "正在进行人肉调试...",
    "这个接口返回的是 'success'，但数据是空的。",
    "正在用眼神杀死 Bug。",
    "我的代码没有逻辑，只有感情。",
    "正在尝试理解多线程...",
    "这个 Bug 我修了一天，结果拼写错误。",
    "正在假装听懂了需求...",
    "我的代码是开源的，但不建议你用。",
    "正在等待 npm install...",
    "这个项目是我用脚写出来的。",
    "正在试图用代码感动电脑。",
    "我的代码很环保，全是绿色（注释）。",
    "正在把 Bug 甩锅给网络波动。",
    "这个功能是多余的，但我懒得删。",
    "正在尝试用 HTML 编程...",
    "我的代码充满了 try-catch，因为我很怂。",
    "正在祈祷服务器不要崩...",
    "这个变量是全局的，怕不怕？",
    "正在试图用 Ctrl+Z 撤销人生。",
    "我的代码是面向对象（钱）编程。",
    "正在尝试理解异步回调地狱...",
    "这个 Bug 是特性的一部分，为了增加用户的使用乐趣。",
    "正在把 Bug 变成 VIP 功能...",
    "我的代码很短，但很致命。",
    "正在尝试用汇编语言写 Hello World...",
    "这个项目已经烂尾了，但还要维护。",
    "正在试图用代码解释为什么我没有女朋友。",
    "我的代码充满了 TODO，全是未完成的梦想。",
    "正在尝试用 CSS 画蒙娜丽莎...",
    "这个 Bug 我修不好，我选择辞职。",
    "正在试图用代码控制世界...",
    "我的代码是 0 和 1 的艺术（垃圾）。",
    "正在尝试理解量子计算...",
    "这个 Bug 是薛定谔的 Bug，你不看它就没有。",
    "正在试图用代码证明 1+1=3...",
    "我的代码很贵，按行收费。",
    "正在尝试用 Excel 做数据库...",
    "这个 Bug 是为了考验测试人员的能力。",
    "正在试图用代码让老板闭嘴...",
    "我的代码充满了哲理，看不懂是正常的。",
    "正在尝试用 Brainfuck 语言编程...",
    "这个 Bug 是为了提醒用户该休息了。",
    "正在试图用代码找回我的头发...",
    "我的代码是加密的，只有上帝能解密。",
    "正在尝试理解区块链...",
    "这个 Bug 是为了增加游戏的难度。",
    "正在试图用代码实现永生...",
    "我的代码是无价之宝（没人买）。",
    "正在尝试理解元宇宙...",
    "这个 Bug 是为了测试用户的耐心。",
    "正在试图用代码毁灭世界（开玩笑的）...",
    "我的代码是未来的遗产。",
    "正在尝试理解 Web3...",
    "这个 Bug 是为了让用户多刷新几次页面。",
    "正在试图用代码寻找外星人...",
    "我的代码是黑洞，吸干了我的精力。",
    "正在尝试理解 NFT...",
    "这个 Bug 是为了让用户体验更丰富。",
    "正在试图用代码穿越时空...",
    "我的代码是迷宫，进去就出不来。",
    "正在尝试理解 DAO...",
    "这个 Bug 是为了让用户多点几次鼠标。",
    "正在试图用代码制造恐龙...",
    "我的代码是天书，凡人看不懂。",
    "人生苦短，我用Python，然后胖了20斤。",
    "看到那座屎山了吗？那是我打下的江山。",
    "服务器炸了？没事，只要不是机房炸了就行。",
    "我写的代码连我自己都怕，因为它有自己的想法。",
    "不要和我比懒，我懒得和你比。",
    "听说你会修手机？那你帮我贴个膜吧。",
    "我的代码在运行，但我的灵魂已离线。",
    "这世界上没有绝对的安全，除了我的存款。",
    "正在进行脑机接口调试...连接失败，脑容量不足。",
    "其实我是个演员，写代码只是我的伪装。"
];

// ------------------------------------------------
// Chart.js Logic
// ------------------------------------------------
let charts = {};

function createChartConfig(color, bgColor, unit) {
    return {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: Array(20).fill(0),
                borderColor: color,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                fill: true,
                backgroundColor: bgColor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 12, 41, 0.9)',
                    titleFont: { size: 0 },
                    bodyFont: { family: "'JetBrains Mono', monospace", size: 12, weight: 'bold' },
                    padding: 8,
                    cornerRadius: 6,
                    displayColors: false,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    callbacks: {
                        title: () => null,
                        label: (context) => `${context.parsed.y} ${unit}`
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false, tickLength: 0 },
                    ticks: { display: false }
                },
                y: {
                    display: true,
                    min: 0,
                    grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false, tickLength: 0 },
                    ticks: { display: false },
                    border: { display: false }
                }
            },
            animation: { duration: 0 }
        }
    };
}

function initCharts() {
    const pingEl = document.getElementById('chart-ping');
    const trafficEl = document.getElementById('chart-traffic');
    const memEl = document.getElementById('chart-memory');

    if (!pingEl || !trafficEl || !memEl) return;

    charts.ping = new Chart(pingEl.getContext('2d'), createChartConfig('#892cdc', 'rgba(137, 44, 220, 0.1)', 'ms'));
    charts.traffic = new Chart(trafficEl.getContext('2d'), createChartConfig('#00f260', 'rgba(0, 242, 96, 0.1)', 'PPS'));
    charts.memory = new Chart(memEl.getContext('2d'), createChartConfig('#f1c40f', 'rgba(241, 196, 15, 0.1)', 'MB'));

    charts.ping.update();
    charts.traffic.update();
    charts.memory.update();
}

ipcRenderer.on('update-stats', (event, stats) => {
    if (charts.ping) updateChart(charts.ping, stats.ping);
    if (charts.traffic) updateChart(charts.traffic, stats.pps);
    if (charts.memory) updateChart(charts.memory, stats.memory);

    const pPing = document.getElementById('val-ping');
    const pPps = document.getElementById('val-pps');
    const pMem = document.getElementById('val-mem');

    if (pPing) pPing.innerText = stats.ping + 'ms';
    if (pPps) pPps.innerText = stats.pps;
    if (pMem) pMem.innerText = stats.memory.toFixed(1);
});

function updateChart(chart, val) {
    const data = chart.data.datasets[0].data;
    data.shift();
    data.push(val);
    chart.update('none');
}

// ------------------------------------------------
// [New] Quick Commands Logic
// ------------------------------------------------

// 预设指令数据
const PRESET_MACROS = {
    "Proxy Core (代理核心)": [
        { name: "刷新验证", cmd: "/proxy reauth", desc: "强制刷新微软验证Token", source: "Native" },
        { name: "插件列表", cmd: "/proxy plugins", desc: "查看已加载的插件", source: "Native" },
        { name: "服务器列表", cmd: "/proxy server", desc: "查看/切换服务器", source: "Native" },
        { name: "添加服务器", cmd: "/proxy addserver", desc: "用法: /proxy addserver <名> <IP>", source: "Native" },
        { name: "帮助菜单", cmd: "/proxy help", desc: "查看代理指令帮助", source: "Native" }
    ],
    "Bedwars Queue (起床排队)": [
        { name: "Solos (单人)", cmd: "/1s", desc: "加入单人模式 (bedwars_eight_one)", source: "QuickBW" },
        { name: "Doubles (双人)", cmd: "/2s", desc: "加入双人模式 (bedwars_eight_two)", source: "QuickBW" },
        { name: "Threes (3v3)", cmd: "/3s", desc: "加入3v3模式 (bedwars_four_three)", source: "QuickBW" },
        { name: "Fours (4v4)", cmd: "/4s", desc: "加入4v4模式 (bedwars_four_four)", source: "QuickBW" },
        { name: "4v4 (两队)", cmd: "/44s", desc: "加入4v4对决 (bedwars_two_four)", source: "QuickBW" },
        { name: "Requeue (重排)", cmd: "/rq", desc: "重新加入上一局游戏模式", source: "RQcommand" }
    ],
    "Information (信息查询)": [
        { name: "Ping (延迟)", cmd: "/ping", desc: "查看当前网络延迟", source: "PingTps" },
        { name: "TPS (性能)", cmd: "/tps", desc: "查看服务端TPS状态", source: "PingTps" },
        { name: "查皮肤 (Skin)", cmd: "/findskin", desc: "用法: /findskin <玩家名>", source: "NickAlerts" },
        { name: "查成分 (Check)", cmd: "/v", desc: "用法: /v <玩家名>", source: "Urchin" }
    ],
    "Feature Controls (功能开关)": [
        { name: "反隐身 (总开关)", cmd: "/ts toggle", desc: "开启/关闭 TrueSight 反隐身", source: "AntiInvis" },
        { name: "反隐身 (火焰)", cmd: "/ts fire", desc: "开关隐身实体的火焰标记", source: "AntiInvis" },
        { name: "反隐身 (警报)", cmd: "/ts alert", desc: "开关发现隐身时的文字警报", source: "AntiInvis" },
        { name: "自动乞讨 (开关)", cmd: "/beg toggle", desc: "开启/关闭自动求Rank", source: "AutoBeg" },
        { name: "自动乞讨 (测试)", cmd: "/beg test", desc: "测试发送乞讨消息", source: "AutoBeg" },
        { name: "中译英 (Zh->En)", cmd: "/fanyi toggle zh-en", desc: "开关: 发送消息自动中译英", source: "Translation" },
        { name: "英译中 (En->Zh)", cmd: "/fanyi toggle en-zh", desc: "开关: 接收消息自动英译中", source: "Translation" },
        { name: "Urchin API测试", cmd: "/testapi", desc: "测试连接 Urchin 黑名单数据库", source: "Urchin" }
    ]
};

// 获取用户自定义的指令
let userQuickCommands = JSON.parse(localStorage.getItem('ms-proxy-quick-cmds') || '[]');

function renderQuickCommands() {
    const container = document.getElementById('quick-cmd-list');
    if (!container) return;
    container.innerHTML = '';

    // 1. 渲染用户自定义部分 (Custom)
    if (userQuickCommands.length > 0) {
        renderCategory(container, "Custom (自定义)", userQuickCommands, true);
    }

    // 2. 渲染预设部分 (Presets)
    for (const [category, cmds] of Object.entries(PRESET_MACROS)) {
        renderCategory(container, category, cmds, false);
    }
}

// 辅助函数：渲染单个分类
function renderCategory(container, title, commands, isCustom) {
    // 创建标题
    const header = document.createElement('div');
    header.className = 'cmd-category-title';
    header.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${title}`;
    container.appendChild(header);

    // 创建网格容器
    const grid = document.createElement('div');
    grid.className = 'category-grid';

    commands.forEach((cmd, index) => {
        const card = document.createElement('div');
        card.className = 'cmd-card';

        // 删除按钮仅对自定义指令显示
        const deleteBtnHtml = isCustom
            ? `<button class="cmd-btn del" onclick="delQuickCmd(${index})" title="Delete"><i class="fa-solid fa-trash"></i></button>`
            : '';

        // 构建指令内容 (防止单引号转义问题，使用 escape)
        const cmdBody = cmd.cmd || cmd.body;
        const cmdName = cmd.name || cmd.desc;
        const cmdDesc = cmd.desc || '';
        const cmdSource = cmd.source || (isCustom ? cmd.plugin : 'System');
        const cmdString = cmdBody.replace(/'/g, "\\'");

        card.innerHTML = `
            <span class="cmd-plugin-tag">${cmdSource}</span>
            <div class="cmd-info">
                <span class="cmd-name">${cmdName}</span>
                <span class="cmd-body-preview">${cmdBody}</span>
                ${cmdDesc && cmdDesc !== cmdName ? `<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${cmdDesc}</div>` : ''}
            </div>
            <div class="cmd-actions">
                <button class="cmd-btn run" onclick="sendProxyCommand('${cmdString}', this)">
                    <i class="fa-solid fa-paper-plane"></i> Send
                </button>
                ${deleteBtnHtml}
            </div>
        `;
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

// [修改] 统一的发送指令函数
window.sendProxyCommand = (command, btnElement) => {
    if (!command) return;

    // 发送 IPC 消息给主进程 (main.js 已有处理逻辑)
    ipcRenderer.send('run-proxy-command', command);

    // 按钮反馈动画
    if (btnElement) {
        const originalHtml = btnElement.innerHTML;
        const originalBg = btnElement.style.background;

        btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Sent';
        btnElement.style.background = 'var(--success)';
        btnElement.style.color = '#000';

        setTimeout(() => {
            btnElement.innerHTML = originalHtml;
            btnElement.style.background = originalBg;
            btnElement.style.color = '';
        }, 800);
    }
};

window.delQuickCmd = (index) => {
    if (confirm(currentLang === 'zh' ? '删除此自定义指令？' : 'Delete this custom command?')) {
        userQuickCommands.splice(index, 1);
        saveQuickCmds();
        renderQuickCommands();
    }
};

function saveQuickCmds() {
    localStorage.setItem('ms-proxy-quick-cmds', JSON.stringify(userQuickCommands));
}

const cmdModal = document.getElementById('cmd-modal');
document.getElementById('btn-add-cmd').addEventListener('click', () => {
    document.getElementById('cmd-plugin-input').value = '';
    document.getElementById('cmd-desc-input').value = '';
    document.getElementById('cmd-body-input').value = '';
    cmdModal.classList.remove('hidden');
});

document.getElementById('cmd-cancel-btn').addEventListener('click', () => {
    cmdModal.classList.add('hidden');
});

document.getElementById('cmd-save-btn').addEventListener('click', () => {
    const plugin = document.getElementById('cmd-plugin-input').value.trim() || 'Custom';
    const name = document.getElementById('cmd-desc-input').value.trim() || 'Command';
    const cmd = document.getElementById('cmd-body-input').value.trim();

    if (!cmd) {
        alert(currentLang === 'zh' ? '指令内容不能为空！' : 'Command Body is required!');
        return;
    }

    // 兼容新旧数据结构
    userQuickCommands.push({ plugin, name, cmd, desc: name, source: 'User' });
    saveQuickCmds();
    renderQuickCommands();
    cmdModal.classList.add('hidden');
});

// ------------------------------------------------

function updateLanguage(lang) {
    const t = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });

    document.getElementById('current-lang-text').innerText = t.langBtn;

    const modalHeader = document.querySelector('#server-modal .modal-header h3');
    if (modalHeader) modalHeader.innerText = t.modalTitle;

    const inputLabels = document.querySelectorAll('#server-modal .input-label');
    if (inputLabels.length >= 2) {
        inputLabels[0].innerText = t.savedServers;
        inputLabels[1].innerText = t.customIp;
    }
    document.getElementById('modal-cancel-btn').innerText = t.btnReturn;
    document.getElementById('modal-save-btn').innerText = t.btnSave;

    document.getElementById('config-modal-title').innerText = t.configTitle;
    document.getElementById('config-cancel-btn').innerText = t.btnCancel;
    document.getElementById('config-save-btn').innerText = t.saveConfig;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.title = t.logoutTitle;

    const redeemCancel = document.getElementById('redeem-cancel-btn');
    if (redeemCancel) redeemCancel.innerText = t.btnCancel;

    const redeemConfirm = document.getElementById('redeem-confirm-btn');
    if (redeemConfirm) redeemConfirm.innerText = t.btnRedeem;

    const quickCmdBtn = document.querySelector('.nav-btn[data-target="view-quick-cmd"]');
    if (quickCmdBtn) quickCmdBtn.title = t.quickCmdTitle;

    ipcRenderer.send('refresh-plugins');
}

function translateLog(text) {
    if (currentLang !== 'zh') return text;
    let t = text;
    t = t.replace(/System Ready/gi, '系统就绪')
        .replace(/Switched to/gi, '已切换至')
        .replace(/Proxy started/gi, '代理服务已启动')
        .replace(/Listening on/gi, '监听端口')
        .replace(/Client connected/gi, '客户端已连接')
        .replace(/Client disconnected/gi, '客户端断开连接');
    return t;
}

function applyTheme(themeName) {
    if (!themeName || themeName === 'starry') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }
    localStorage.setItem('ms-proxy-theme', themeName);

    document.querySelectorAll('.theme-option').forEach(opt => {
        if (opt.getAttribute('data-theme') === themeName) {
            opt.classList.add('active');
        } else if (themeName === 'starry' && opt.getAttribute('data-theme') === 'starry') {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function renderResources() {
    const container = document.getElementById('resources-list');
    if (!container) return;
    container.innerHTML = '';
    webResources.forEach(res => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${res.url}`;
        card.innerHTML = `
            <img src="${iconUrl}" class="resource-icon" onerror="this.src='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/svgs/solid/globe.svg'">
            <span class="resource-name">${res.name}</span>
            <i class="fa-solid fa-arrow-up-right-from-square resource-link-icon"></i>
        `;
        card.addEventListener('click', () => {
            shell.openExternal(res.url);
        });
        container.appendChild(card);
    });
}

function startClock() {
    function update() {
        const date = new Date();
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const beijingDate = new Date(utc + (3600000 * 8));

        const timeStr = beijingDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = beijingDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

        const timeEl = document.getElementById('clock-time');
        const dateEl = document.getElementById('clock-date');

        if (timeEl) timeEl.innerText = timeStr;
        if (dateEl) dateEl.innerText = dateStr;
    }
    update();
    setInterval(update, 1000);
}

function setupQuoteGenerator() {
    const display = document.getElementById('quote-display');
    const btn = document.getElementById('new-quote-btn');

    function showRandomQuote() {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        display.style.opacity = 0;
        setTimeout(() => {
            display.innerText = `"${randomQuote}"`;
            display.style.opacity = 1;
        }, 200);
    }

    if (btn) {
        btn.addEventListener('click', showRandomQuote);
    }
    showRandomQuote();
}

const redeemModal = document.getElementById('redeem-modal');
const redeemInput = document.getElementById('redeem-license-input');
const redeemConfirmBtn = document.getElementById('redeem-confirm-btn');
const redeemCancelBtn = document.getElementById('redeem-cancel-btn');

const renewBtn = document.getElementById('renew-btn');
if (renewBtn) {
    renewBtn.addEventListener('click', () => {
        const username = document.getElementById('settings-username').innerText;
        if (!username || username === 'Guest') {
            alert(currentLang === 'zh' ? "无法获取当前用户名，请检查登录状态。" : "Cannot get username. Please login.");
            return;
        }

        redeemInput.value = '';
        redeemModal.classList.remove('hidden');
        setTimeout(() => redeemInput.focus(), 100);
    });
}






const savedTheme = localStorage.getItem('ms-proxy-theme') || 'starry';
applyTheme(savedTheme);
renderResources();
startClock();
setupQuoteGenerator();
updateLanguage(currentLang);
initCharts();
renderQuickCommands();
// try {
//     initAccountQuery();
// } catch (e) {
//     console.error('Failed to initialize account module:', e);
//     alert('Account Module Init Failed: ' + e.message);
// }

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;
        showSection(targetId);
    });
});

function showSection(targetId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    document.querySelectorAll('.view-section').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
    });

    const targetView = document.getElementById(targetId);
    if (targetView) {
        if (targetId === 'view-dashboard' || targetId === 'view-stats' || targetId === 'view-settings' || targetId === 'view-resources' || targetId === 'view-quick-cmd') {
            targetView.style.display = 'block';
        } else {
            targetView.style.display = 'flex';
        }

        void targetView.offsetWidth;
        targetView.classList.add('active');
    }
}



document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
        const theme = opt.getAttribute('data-theme');
        applyTheme(theme);
    });
});

document.getElementById('lang-btn').addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    updateLanguage(currentLang);
});

const refreshBtn = document.getElementById('refresh-btn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('i');
        icon.style.transition = 'transform 0.5s';
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => { icon.style.transform = 'none'; }, 500);
        ipcRenderer.send('refresh-plugins');
    });
}

ipcRenderer.on('update-server', (event, serverIp) => {
    document.getElementById('server-ip').innerText = serverIp;
});

ipcRenderer.on('update-player', (event, playerName) => {
    const el = document.getElementById('player-name');
    el.innerText = playerName;
    el.removeAttribute('data-i18n');
});

ipcRenderer.on('reset-player', () => {
    const el = document.getElementById('player-name');
    el.setAttribute('data-i18n', 'waiting');
    el.innerText = translations[currentLang].waiting;
});

ipcRenderer.on('update-plugins', (event, plugins) => {
    const container = document.getElementById('plugins-list');
    container.innerHTML = '';

    const t = translations[currentLang];

    plugins.forEach(plugin => {
        const card = document.createElement('div');
        card.className = plugin.isNew ? 'plugin-card new-plugin' : 'plugin-card';

        let description = plugin.description || 'No description provided.';
        let restartHint = '';

        if (plugin.isNew) {
            description = t.newPluginDesc;
            restartHint = `<div class="restart-hint">${t.restartRequired}</div>`;
        } else {
            card.addEventListener('click', () => openPluginConfig(plugin.name, plugin.displayName));
        }

        card.innerHTML = `
            <div class="plugin-header">
                <span class="plugin-name">${plugin.displayName}</span>
                <span class="plugin-version">${plugin.version}</span>
            </div>
            <div class="plugin-desc">${description}</div>
            ${restartHint}
        `;
        container.appendChild(card);
    });
});

// Log Logic with Search Filter
let currentFilter = '';

function filterLogs() {
    const lines = document.querySelectorAll('.terminal-line');
    lines.forEach(line => {
        const text = line.innerText.toLowerCase();
        if (currentFilter && !text.includes(currentFilter)) {
            line.style.display = 'none';
        } else {
            line.style.display = 'block';
        }
    });
}

document.getElementById('term-search-input').addEventListener('input', (e) => {
    currentFilter = e.target.value.toLowerCase().trim();
    filterLogs();
});

ipcRenderer.on('console-log', (event, text) => {
    const displayWebText = translateLog(text);
    const el = document.getElementById('console-log');
    el.innerText = '> ' + displayWebText;
    el.removeAttribute('data-i18n');

    const termLogs = document.getElementById('terminal-logs');
    const line = document.createElement('div');
    line.className = 'terminal-line';
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    let colorStyle = '';
    if (text.toLowerCase().includes('error')) colorStyle = 'color: #ff4757;';
    if (text.toLowerCase().includes('warn')) colorStyle = 'color: #ffa502;';

    const plainText = `[${timeStr}] ` + displayWebText;

    // Check filter immediately
    if (currentFilter && !plainText.toLowerCase().includes(currentFilter)) {
        line.style.display = 'none';
    }

    line.innerHTML = `<span class="timestamp">[${timeStr}]</span><span class="text" style="${colorStyle}">${escapeHtml(displayWebText)}</span>`;
    termLogs.appendChild(line);

    termLogs.scrollTop = termLogs.scrollHeight;
});

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.getElementById('minimize-btn').addEventListener('click', () => ipcRenderer.send('window-minimize'));
document.getElementById('close-btn').addEventListener('click', () => ipcRenderer.send('window-close'));

// Console Open/Close Logic
document.getElementById('btn-console').addEventListener('click', () => {
    const termOverlay = document.getElementById('full-terminal');
    termOverlay.classList.toggle('visible');

    // Auto focus search when opened
    if (termOverlay.classList.contains('visible')) {
        const termLogs = document.getElementById('terminal-logs');
        termLogs.scrollTop = termLogs.scrollHeight;
        setTimeout(() => document.getElementById('term-search-input').focus(), 100);
    }
});

// Close button logic
document.getElementById('term-close-btn').addEventListener('click', () => {
    const termOverlay = document.getElementById('full-terminal');
    termOverlay.classList.remove('visible');
});

document.getElementById('btn-restart').addEventListener('click', () => {
    const t = translations[currentLang];
    if (confirm(t.restartConfirm)) {
        ipcRenderer.send('restart-app');
    }
});



const serverModal = document.getElementById('server-modal');
const serverListContainer = document.getElementById('server-list');
const ipInput = document.getElementById('custom-ip-input');
const serverStatusCard = document.getElementById('server-status-card');

if (serverStatusCard) {
    serverStatusCard.addEventListener('click', async () => {
        serverModal.classList.remove('hidden');
        serverListContainer.innerHTML = '';
        const servers = await ipcRenderer.invoke('get-servers-config');
        if (servers) {
            Object.keys(servers).forEach(name => {
                const server = servers[name];
                const div = document.createElement('div');
                div.className = 'server-item';
                div.innerHTML = `<span class="server-item-name">${name}</span><span class="server-item-addr">${server.host}:${server.port}</span>`;
                div.addEventListener('click', () => {
                    document.querySelectorAll('.server-item').forEach(i => i.classList.remove('selected'));
                    div.classList.add('selected');
                    ipInput.value = name;
                });
                serverListContainer.appendChild(div);
            });
        }
    });
}

document.getElementById('modal-cancel-btn').addEventListener('click', () => serverModal.classList.add('hidden'));
document.getElementById('modal-save-btn').addEventListener('click', async () => {
    const target = ipInput.value.trim();
    if (!target) return;
    const result = await ipcRenderer.invoke('switch-server-target', target);
    if (result.success) {
        serverModal.classList.add('hidden');
        const el = document.getElementById('console-log');
        el.innerText = `> ${currentLang === 'zh' ? '已切换至' : 'Switched to'} ${target}`;
        el.removeAttribute('data-i18n');
    } else {
        alert((currentLang === 'zh' ? '失败: ' : 'Failed: ') + result.error);
    }
});

const configModal = document.getElementById('plugin-config-modal');
const configFormContainer = document.getElementById('config-form-container');
let currentEditingPlugin = null;
let currentConfigData = null;

async function openPluginConfig(pluginName, displayName) {
    const result = await ipcRenderer.invoke('get-plugin-config', pluginName);
    if (result.error) {
        alert(translations[currentLang].loadConfigFail + '\n' + result.error);
        return;
    }
    currentEditingPlugin = pluginName;
    currentConfigData = result.config;
    document.getElementById('config-modal-title').innerText = displayName;
    buildConfigForm(result.schema, currentConfigData);
    configModal.classList.remove('hidden');
}

function buildConfigForm(schema, config) {
    configFormContainer.innerHTML = '';
    if (!schema || schema.length === 0) {
        configFormContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">No configuration available.</div>';
        return;
    }

    schema.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'config-group';

        if (group.label) {
            const title = document.createElement('div');
            title.className = 'config-group-title';
            title.innerText = group.label;
            groupDiv.appendChild(title);
        }

        group.settings.forEach(setting => {
            const row = document.createElement('div');
            row.className = 'config-row';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'config-info';
            const label = document.createElement('div');
            label.className = 'config-label';
            label.innerText = setting.displayLabel || setting.key.split('.').pop();
            const desc = document.createElement('div');
            desc.className = 'config-desc';
            desc.innerText = setting.description || '';
            infoDiv.appendChild(label);
            infoDiv.appendChild(desc);
            row.appendChild(infoDiv);

            const controlDiv = document.createElement('div');
            const currentValue = getValue(config, setting.key, setting.type);

            if (setting.type === 'toggle' || setting.type === 'soundToggle') {
                const labelSwitch = document.createElement('label');
                labelSwitch.className = 'switch';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = !!currentValue;
                input.addEventListener('change', (e) => {
                    setValue(config, setting.key, e.target.checked);
                });
                const slider = document.createElement('span');
                slider.className = 'slider';
                labelSwitch.appendChild(input);
                labelSwitch.appendChild(slider);
                controlDiv.appendChild(labelSwitch);
            }
            else if (setting.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'config-input';
                input.value = currentValue || '';
                if (setting.placeholder) input.placeholder = setting.placeholder;
                input.addEventListener('input', (e) => {
                    setValue(config, setting.key, e.target.value);
                });
                controlDiv.appendChild(input);
            }
            else if (setting.type === 'cycle') {
                const select = document.createElement('select');
                select.className = 'config-input';
                if (setting.values) {
                    setting.values.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt.value;
                        option.innerText = opt.text;
                        if (opt.value == currentValue) option.selected = true;
                        select.appendChild(option);
                    });
                }
                select.addEventListener('change', (e) => {
                    let val = e.target.value;
                    if (setting.values && typeof setting.values[0].value === 'number') {
                        val = Number(val);
                    }
                    setValue(config, setting.key, val);
                });
                controlDiv.appendChild(select);
            }

            row.appendChild(controlDiv);
            groupDiv.appendChild(row);
        });
        configFormContainer.appendChild(groupDiv);
    });
}

function getValue(obj, path, type) {
    if (!obj) return undefined;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current[key] === undefined) return undefined;
        current = current[key];
    }
    return current;
}

function setValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

document.getElementById('config-cancel-btn').addEventListener('click', () => {
    configModal.classList.add('hidden');
    currentEditingPlugin = null;
});

document.getElementById('config-save-btn').addEventListener('click', async () => {
    if (!currentEditingPlugin || !currentConfigData) return;
    const result = await ipcRenderer.invoke('save-plugin-config', currentEditingPlugin, currentConfigData);
    if (result.success) {
        configModal.classList.add('hidden');
        const el = document.getElementById('console-log');
        el.innerText = `> ${translations[currentLang].saveConfigSuccess}`;
        el.removeAttribute('data-i18n');
    } else {
        alert(translations[currentLang].saveConfigFail + '\n' + result.error);
    }
});

// --- New: Network Optimization Button Click Event ---
const optimizeBtn = document.getElementById('run-optimizer-btn');
if (optimizeBtn) {
    optimizeBtn.addEventListener('click', async () => {
        optimizeBtn.disabled = true;
        const originalText = optimizeBtn.innerHTML;
        optimizeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running...';

        try {
            const result = await ipcRenderer.invoke('run-optimizer');
            if (result.success) {
                alert(translations[currentLang].optSuccess);
            } else {
                alert(translations[currentLang].optFail + result.error);
            }
        } catch (e) {
            alert(translations[currentLang].optFail + e.message);
        } finally {
            optimizeBtn.disabled = false;
            optimizeBtn.innerHTML = originalText;
        }
    });
}

// --- Account/Stats Module Logic (3D Refactor) ---
// --- Player Account Query Module (Clean Refactor) ---
// let skinViewer = null; // Moved to top

function initAccountQuery() {
    // alert('Init Account Query Started'); // Debug
    logToUI('Initializing Account Search Module...');

    const btnSearch = document.getElementById('btn-search-stats');
    const inputSearch = document.getElementById('stats-username-input');

    if (!btnSearch) logToUI('CRITICAL: Search button not found in DOM', true);
    if (!inputSearch) logToUI('CRITICAL: Input field not found in DOM', true);

    // 1. Initialize 3D Viewer (Safe Guarded)
    if (typeof skinview3d !== 'undefined' && document.getElementById('skin-container')) {
        try {
            if (!skinViewer) {
                skinViewer = new skinview3d.SkinViewer({
                    canvas: document.getElementById('skin-container'),
                    width: 200,
                    height: 10,
                    skin: 'img/steve.png',
                    zoom: 0.6,
                    fov: 70
                });

                // Adjust vertical position to show more of the player (move camera down relative to player, or player up)
                // Skinview3d defaults are usually centered, but zooming out helps.
                // We can also adjust the camera position:
                skinViewer.camera.position.y = 0; // Negative Y moves camera DOWN -> Model looks HIGHER

                skinViewer.animation = new skinview3d.WalkingAnimation();
                skinViewer.animation.speed = 0.5;
                skinViewer.autoRotate = true;
                skinViewer.autoRotateSpeed = 0.5;
            }
        } catch (e) {
            console.error('[Account] Failed to init 3D viewer:', e);
        }
    } else {
        console.warn('[Account] skinview3d lib missing or container not found.');
    }

    // 2. Animation Controls
    const bindAnimBtn = (id, action) => {
        const btn = document.getElementById(id);
        if (btn && skinViewer) btn.addEventListener('click', action);
    };

    bindAnimBtn('btn-anim-walk', () => skinViewer.animation = new skinview3d.WalkingAnimation());
    bindAnimBtn('btn-anim-run', () => skinViewer.animation = new skinview3d.RunningAnimation());
    bindAnimBtn('btn-anim-rotate', () => skinViewer.autoRotate = !skinViewer.autoRotate);
    bindAnimBtn('btn-anim-pause', () => {
        if (skinViewer.animation) {
            skinViewer.animation.paused = !skinViewer.animation.paused;
        }
    });

    // 3. Search Event Listeners
    if (btnSearch) {
        // Remove old listeners by cloning
        const newBtn = btnSearch.cloneNode(true);
        btnSearch.parentNode.replaceChild(newBtn, btnSearch);

        newBtn.addEventListener('click', () => {
            console.log('[Account] Button clicked');
            // FIX: Query the input dynamically
            const currentInput = document.getElementById('stats-username-input');
            const username = currentInput ? currentInput.value.trim() : '';

            if (username) fetchAccountInfo(username);
            else alert(translations['zh'].searchPlaceholder);
        });
    }

    if (inputSearch) {
        const newInput = inputSearch.cloneNode(true);
        inputSearch.parentNode.replaceChild(newInput, inputSearch);

        newInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const username = newInput.value.trim();
                if (username) fetchAccountInfo(username);
            }
        });
    }
}

function logToUI(msg, isError = false) {
    // 1. Footer Console
    const el = document.getElementById('console-log');
    if (el) {
        el.innerText = '> ' + msg;
        el.removeAttribute('data-i18n');
        el.style.color = isError ? '#ff4757' : '';
    }

    // 2. Terminal Overlay
    const termLogs = document.getElementById('terminal-logs');
    if (termLogs) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        // Use generic text color for logs unless error
        const colorStyle = isError ? 'color:#ff4757' : 'color:#e0e0e0';
        line.innerHTML = `<span class="timestamp">[${timeStr}]</span><span class="text" style="${colorStyle}">[Frontend] ${msg}</span>`;
        termLogs.appendChild(line);
        termLogs.scrollTop = termLogs.scrollHeight;
    }
}

async function fetchAccountInfo(username) {
    console.log('[Account] Fetching info for:', username);
    logToUI(`Starting query for user: ${username}`);

    const loading = document.getElementById('stats-loading');
    const content = document.getElementById('stats-content-area');
    const errorDiv = document.getElementById('stats-error');
    const errorMsg = document.getElementById('stats-error-msg');

    loading.classList.remove('hidden');
    content.classList.add('hidden');
    errorDiv.classList.add('hidden');

    try {
        // Mojang API: UUID
        logToUI('Requesting UUID from Mojang API...');
        const uuidResp = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        if (!uuidResp.ok) throw new Error('Mojang API: Player not found');
        const uuidData = await uuidResp.json();

        // Session API: Skin/Cape
        logToUI('Requesting Profile from Session Server...');
        const profileResp = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuidData.id}`);
        if (!profileResp.ok) throw new Error('Session API: Failed to get profile');
        const profileData = await profileResp.json();

        // Decode Textures
        logToUI('Decoding texture data...');
        let textures = { skin: null, cape: null, slim: false };
        if (profileData.properties) {
            const prop = profileData.properties.find(p => p.name === 'textures');
            if (prop) {
                const decoded = JSON.parse(atob(prop.value));
                if (decoded.textures.SKIN) {
                    textures.skin = decoded.textures.SKIN.url;
                    if (decoded.textures.SKIN.metadata?.model === 'slim') textures.slim = true;
                }
                if (decoded.textures.CAPE) {
                    textures.cape = decoded.textures.CAPE.url;
                }
            }
        }

        renderAccountData({
            username: uuidData.name,
            uuid: uuidData.id,
            textures: textures
        });

        loading.classList.add('hidden');
        content.classList.remove('hidden');

        if (skinViewer) {
            // Force unnecessary resize check
            skinViewer.width = 300;
            skinViewer.height = 400;
        }
        logToUI(`Successfully loaded: ${uuidData.name}`);

    } catch (err) {
        console.error('[Account] Error:', err);
        logToUI(`Error: ${err.message}`, true);
        loading.classList.add('hidden');
        errorDiv.classList.remove('hidden');
        errorMsg.innerText = `Error: ${err.message}`;
    }
}

function renderAccountData(data) {
    const t = translations[currentLang];

    // 1. Update Text Info
    document.getElementById('stats-username').innerText = data.username;
    document.getElementById('stats-uuid').innerText = data.uuid;
    document.getElementById('stats-rank').innerText = 'PLAYER'; // Generic label
    document.getElementById('stats-status').innerText = 'Mojang Verified'; // Static status

    // 2. Update 3D Model
    if (skinViewer) {
        if (data.textures.skin) {
            skinViewer.loadSkin(data.textures.skin, data.textures.slim ? 'slim' : 'default');
        }
        skinViewer.loadCape(data.textures.cape); // Works even if null
    }

    // 3. Update Cape Card
    const capeImg = document.getElementById('cape-image');
    const noCapeMsg = document.getElementById('no-cape-msg');
    const capeName = document.getElementById('cape-name');

    if (data.textures.cape) {
        capeImg.src = data.textures.cape;
        capeImg.classList.remove('hidden');
        noCapeMsg.classList.add('hidden');
        capeName.innerText = 'Official Cape';
    } else {
        capeImg.classList.add('hidden');
        noCapeMsg.classList.remove('hidden');
        capeName.innerText = 'No Cape';
    }

    // 4. Cleanup
    const tabs = document.querySelector('.gamemode-tabs');
    if (tabs) tabs.style.display = 'none';
}

function createStatBox(label, value, isHighlight = false, isGood = false) {
    // Legacy - Kept empty or just helper
    return '';
}

ipcRenderer.send('ui-ready');

// --- Security: Anti-Tampering (Disable Context Menu & Shortcuts) ---
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', (e) => {
    // 1. Block F12 (DevTools)
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }

    // 2. Block Ctrl+Shift+I / Ctrl+Shift+J (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        return false;
    }

    // 3. Block Ctrl+R / F5 (Reload) - Optional but good for "kiosk" mode
    if ((e.ctrlKey && (e.key === 'R' || e.key === 'r')) || e.key === 'F5') {
        e.preventDefault();
        return false;
    }
});