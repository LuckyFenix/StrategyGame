require('./Vector');
require('./JavelinThrower');
require('./Berserker');
require('./World');
require('./UsersDAO');

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var userDAO = new UsersDAO();

var app = express();


global.world = new World(600, 800);
var users = [];

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

app.use(function(req, res, next)
{
    var ip = req.ip;
    var person = getPersonByIP(ip);
    if (person == null)
    {
        userDAO.Users.findOne({ip : ip}, function (err, user)
        {
            if (err)
                return console.error(err);
            if (user != null)
            {
                if (user.type == 'javelin_thrower')
                {
                    var jt = new JavelinThrower(user.character.name, 'человек', 70, 30, 50, 10, 50, 20, 0.05, 'physical', 5, user.character.positionX, user.character.positionY, 0.9);
                    jt.hitPoint = user.character.hitPoint;
                    jt.way = user.character.way;
                    users.push([ip, jt, 'javelin_thrower', 0]);

                } else if (user.type == 'berserker')
                {
                    var b = new Berserker(user.name, 'орк', 30, 54, 40, 8, 55, 25, 0.15, 'physical', 8, user.positionX, user.positionY, 0.85);
                    b.hitPoint = user.character.hitPoint;
                    b.way = user.character.way;
                    users.push([ip, b, 'berserker', 0]);
                }
                if (users.length == 1)
                {
                    users[0][3] = 1;
                }
            }
            next();
        });
    } else
    {
        next();
    }
});

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

        users.push([ip, new JavelinThrower(name, 'человек', 70, 30, 50, 10, 50, 20, 0.05, 'physical', 5, x, y, 0.9), 'javelin_thrower', 0]);
    } else if (type == 'berserker')
    {
        do {
            x = getRandomInt(0, world.fields.length - 1);
            y = getRandomInt(0, world.fields[0].length - 1);
        } while (world.fields == 'x');

        users.push([ip, new Berserker(name, 'орк', 30, 54, 40, 8, 55, 25, 0.15, 'physical', 8, x, y, 0.85), 'berserker', 0]);
    } else
    {
        res.send(200, 'Невірно вказаний тип персонажа.');
        return;
    }
    if (users.length == 1)
    {
        users[0][3] = 1;
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
    if (user[3] == 0)
    {
        res.send(200, 'Зараз не ваш хід.');
        return;
    }
    if (user[1].way.length == 0)
    {
        res.status(200).send('Ви не визначились з шляхом.');
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
    if (user[3] == 0)
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
    if (getPersonByIP(ip)[3] == 0)
    {
        res.status(200).send('Зараз не ваш хід.');
        return;
    }
    var object = getPersonByName(req.params.object);
    var fight_result = getPersonByIP(ip)[1].fight(object[1]);
    console.log(fight_result);
    if (fight_result != undefined)
    {
        res.status(200).send(fight_result);
        return;
    }
    var response = '<div>У вас залишилось ' + getPersonByIP(ip)[1].curentMovePoints + ' очків руху</div>';
    response += getStatus();
    res.status(200).send(response);
});

app.get('/end', function(req, res, next) //Закінчити хід
{
    var ip = req.ip;
    getPersonByIP(ip)[1].end();
    getPersonByIP(ip)[3] = 0;
    var i = users.indexOf(getPersonByIP(ip));
    if (i == users.length - 1)
    {
        users[0][3] = 1;
    }
    else
    {
        users[i + 1][3] = 1;
    }
    userDAO.updateUsers(users);
    res.status(200).send('Хід закінчено.');
});

app.get('/status', function(req, res, next) //Побачити ситуацію на полі бою
{
    var ip = req.ip;
    var response = '';
    if (getPersonByIP(ip) == null) {
        response += '<div>Зараз не ваш хід.</div>';
    } else if (getPersonByIP(ip)[3] == 0) {
        response += '<div>Зараз не ваш хід.</div>';
    } else {
        response += '<div>У вас залишилось ' + getPersonByIP(ip)[1].curentMovePoints + ' очків руху</div>';
    }
    response += getStatus();
    res.status(200).send(response);
});

app.listen(3030, function () {
    console.log('Server start on port = 3030');
});