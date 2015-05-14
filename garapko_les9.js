require('./Vector');
require('./JavelinThrower');
require('./Berserker');
require('./World');

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
app.set('port', 3030);

http.createServer(app).listen(app.get('port'), function()
{
    console.log('Server start on port' + app.get('port'));
});

var users = [];

global.world = new World(600, 800);

function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStatus()
{
    var status = '';
    var l = users.length;
    for (var i = 0; i < l; i++)
    {
        status += '<div>Персонаж ' + users[i][1].name + '(' + users[i][1].hitPoint + '/' + users[i][1].baseHitPoint + 'hp) ' +
            'знаходиться на клітинці (' + users[i][1].positionX + ',' + users[i][1].positionY + ')</div>';
    }
    return status;
}

function getPersonByIP(ip)
{
    var l = users.length;
    for (var i = 0; i < l; i++)
    {
        if (ip == users[i][0])
        {
            return users[i];
        }
    }
    return null;
}

function getPersonByName(name)
{
    var l = users.length;
    for (var i = 0; i < l; i++)
    {
        if (name == users[i][1].name)
        {
            return users[i];
        }
    }
    return null;
}

app.get('/new_hero', function (req, res, next) //Інструкція по створенню персонажа
{
    var ip = req.ip;
    for (var i = 0; i < users.length; i++)
    {
        if (users[i][0] == ip && users[i][1] != undefined)
        {
            res.send(200, 'Для цього ip вже створено персонажа!')
            return;
        }
    }
    res.status(200).send(
        '<div>Виберіть тип персонажа:</div>' +
        '<div>Javelin Thrower(strength 70, agility 30, vitality5 50, defence 10, команда(javelin_thrower/ім\'я_персонажа)</div>' +
        '<div>Berserker(strength 30 agility 54, vitality5 40, defence 8, команда(berserker/ім\'я_персонажа)</div>'
    );
});

app.get('/new_hero/:type/:name', function (req, res, next) //Створення персонажу певного типу, прив'язаного до ір
{
    var ip = req.ip;
    for (var i = 0; i < users.length; i++)
    {
        if (users[i][0] == ip && users[i][1] != undefined)
        {
            res.status(200).send('Для цього ip вже створено персонажа!');
            return;
        }
    }
    var type = req.params.type;
    var name = req.params.name;
    for (i = 0; i < users.length; i++)
    {
        if (users[i][1].name == name)
        {
            res.send(200, 'Таке ім\'я вже існує.');
            return;
        }
    }

    var x;
    var y;
    if (type == 'javelin_thrower')
    {
        do {
            x = getRandomInt(0, world.fields.length - 1);
            y = getRandomInt(0, world.fields[0].length);
        } while (world.fields == 'x');

        users.push([ip, new JavelinThrower(name, 'орк', 70, 30, 50, 10, 8, 8, 0.05, 'physical', 5, x, y, 0.9), 0])
    } else if (type == 'berserker')
    {
        do {
            x = getRandomInt(0, world.fields.length - 1);
            y = getRandomInt(0, world.fields[0].length - 1);
        } while (world.fields == 'x');

        users.push([ip, new Berserker(name, 'орк', 30, 54, 40, 8, 12, 10, 0.15, 'physical', 8, x, y, 0.85), 0])
    } else
    {
        res.send(200, 'Невірно вказаний тип персонажа.');
        return;
    }
    if (users.length == 1)
    {
        users[0][2] = 1;
    }
    res.status(200).send('Персонажа створено!')
});

app.get('/move_to', function(req, res, next) //Продовжити рух до попередньої координати
{
    var ip = req.ip;
    var user = getPersonByIP(ip);
    if (user == null)
    {
        res.status(200).send('Персонаж не був створений!');
        return;
    }
    if (user[2] == 0)
    {
        res.send(200, 'Зараз не ваш хід.');
        return;
    }
    getPersonByIP(ip)[1].move_to(null);
    var response = '<div>У вас залишилось ' + getPersonByIP(ip)[1].curentMovePoints + ' очків руху</div>';
    response += getStatus();
    res.status(200).send(response);
});

app.get('/move_to/:x/:y', function(req, res, next) //Рух до координати
{
    var ip = req.ip;
    var user = getPersonByIP(ip);
    if (user == null)
    {
        res.status(200).send('Персонаж не був створений!');
        return;
    }
    if (user[2] == 0)
    {
        res.send(200, 'Зараз не ваш хід.');
        return;
    }
    var x = req.params.x;
    var y = req.params.y;
    var response = '';
    if (isNaN(x) || isNaN(y))
    {
        response += 'Невірний формат координат.';
    } else if (x < 0 || x >= world.w || y < 0 || y >= world.h)
    {
        response += 'Невірний формат координат.';
    } else if (x == user[1].positionX && y == user[1].positionY)
    {
        response += 'Неможливий напрямок';
    } else
    {
        user[1].move_to(new Vector(x, y));
    }
    response += '<div>У вас залишилось ' + user[1].curentMovePoints + ' очків руху</div>';
    response += getStatus();
    res.status(200).send(response);
});

app.get('/fight/:object', function(req, res, next) //Атакувати об'єкт
{
    var ip = req.ip;
    if (getPersonByIP(ip)[2] == 0)
    {
        res.send(200, 'Зараз не ваш хід.');
        return;
    }
    var object = getPersonByName(req.params.object);
    if (object == null)
    {
        res.send(200, 'Такої цілі не існує.');
        return;
    }
    if (getPersonByIP(ip)[1].curentMovePoints < getPersonByIP(ip)[1].movePoints)
    {
        res.send(200, 'Недостатньо очків руху.');
        return;
    }
    getPersonByIP(ip)[1].fight(object);
    var response = '<div>У вас залишилось ' + getPersonByIP(ip)[1].curentMovePoints + ' очків руху</div>';
    response += getStatus();
    res.status(200).send(response);
});

app.get('/end', function(req, res, next) //Закінчити хід
{
    var ip = req.ip;
    getPersonByIP(ip)[1].end();
    getPersonByIP(ip)[2] = 0;
    var i = users.indexOf(getPersonByIP(ip));
    if (i == users.length - 1)
        users[0][2] = 1;
    else
        users[i + 1][2] = 1;
    res.status(200).send('Хід закінчено.');
});

app.get('/status', function(req, res, next) //Побачити ситуацію на полі бою
{
    var ip = req.ip;
    var response = '';
    if (getPersonByIP(ip) == null) {
        response += '<div>Зараз не ваш хід.</div>';
    } else if (getPersonByIP(ip)[2] == 0) {
        response += '<div>Зараз не ваш хід.</div>';
    } else {
        response += '<div>У вас залишилось ' + getPersonByIP(ip)[1].curentMovePoints + ' очків руху</div>';
    }
    response += getStatus();
    res.status(200).send(response);
});