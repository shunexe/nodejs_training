var express = require('express');
var ejs = require('ejs');

var app = express();
app.engine('ejs', ejs.renderFile);
app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

var data = {
    'Taro': 'taro@yamada',
    'Hanako': 'hanako@flower',
    'Sachico': 'sachico@happy',
    'Ichiro':'ichiro@baseball'
}
app.get('/', (req, res) => {
    var msg = 'This is Index Page!<br>'
        + "※メッセージを書いて送信してください.";

    res.render('index.ejs',
        {
            title: 'Index',
            content: msg,
            data:data,
        }
    );
});

app.post('/', (req, res) => {
    var msg = 'This is Posted Page!<br>' +
        'あなたは「<b>' + req.body.message +
        '</b>」と送信しました.';
    
    res.render('index.ejs', {
        title: 'Posted',
        content: msg,
    });
})
app.get('/other', (req, res) => {
    var msg = 'This is Other Page!<br>'
        + "これは，用意された別のページです.";
    var name = req.query.name;
    var pass = req.query.pass;
    var msg = 'あなたの名前は「' + name + '」<br>パスワードは「' + pass + '」です.';
    res.render('index.ejs',
        {
            title: 'other',
            content: msg,
            link:{href:'/',text:'※トップに戻る．'}
        }
    );
});
app.listen(3000, () => {
    console.log('Server is running!');
});