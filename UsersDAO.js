/**
 * Created by Robert on 23.05.2015.
 */
require('./JavelinThrower');
function UsersDAO()
{
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/gameDB');

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function (callback)
    {
        console.log('DB connect')
    });

    var usersSchema = new mongoose.Schema(
        {
            ip: String,
            character:
            {
                name: String,
                race: String,
                str: Number,
                agl: Number,
                vit: Number,
                defence: Number,
                movePoints: Number,
                curentMovePoints: Number,
                range: Number,
                criticalDamageChance: Number,
                typeOfDamage: String,
                regeneration: Number,
                positionX: Number,
                positionY: Number,
                windRes: Number,
                baseHitPoint: Number,
                hitPoint: Number,
                evasion: Number,
                way: Array
            },
            type: String
        });
    this.Users = mongoose.model('Users', usersSchema);
}

UsersDAO.prototype.updateUsers = function(users)
{
    var Users = this.Users;
    users.forEach(function(user)
    {
        Users.findOne({ip: user[0]}, function(err, u)
        {
            if (err)
                return console.error(err);
            if (u == null)
            {
                u = new Users(
                    {
                        ip: user[0],
                        character: {
                            name: user[1].name,
                            race: user[1].race,
                            str: user[1].str,
                            agl: user[1].agl,
                            vit: user[1].vit,
                            defence: user[1].defence,
                            movePoints: user[1].movePoints,
                            curentMovePoints: user[1].curentMovePoints,
                            range: user[1].range,
                            criticalDamageChance: user[1].criticalDamageChance,
                            typeOfDamage: user[1].typeOfDamage,
                            regeneration: user[1].regeneration,
                            positionX: user[1].positionX,
                            positionY: user[1].positionY,
                            windRes: user[1].windRes,
                            baseHitPoint: user[1].baseHitPoint,
                            hitPoint: user[1].hitPoint,
                            evasion: user[1].evasion,
                            way: user[1].way
                        },
                        type: user[2]
                    }
                );
                u.save(function (err, thor)
                {
                    if (err)
                        return console.error(err);
                    console.log(thor);
                });
            } else
            {
                var bool = true;
                var isCharactersEqual = function (a, b)
                {
                    if (a != b)
                    {
                        bool = false;
                    }
                    return b;
                };
                u.character.name = isCharactersEqual(u.character.name, user[1].name);
                u.character.race = isCharactersEqual(u.character.race, user[1].race);
                u.character.str = isCharactersEqual(u.character.str, user[1].str);
                u.character.agl = isCharactersEqual(u.character.agl, user[1].agl);
                u.character.vit = isCharactersEqual(u.character.vit, user[1].vit);
                u.character.defence = isCharactersEqual(u.character.defence, user[1].defence);
                u.character.movePoints = isCharactersEqual(u.character.movePoints, user[1].movePoints);
                u.character.curentMovePoints = isCharactersEqual(u.character.curentMovePoints, user[1].curentMovePoints);
                u.character.range = isCharactersEqual(u.character.range, user[1].range);
                u.character.criticalDamageChance = isCharactersEqual(u.character.criticalDamageChance, user[1].criticalDamageChance);
                u.character.typeOfDamage = isCharactersEqual(u.character.typeOfDamage, user[1].typeOfDamage);
                u.character.regeneration = isCharactersEqual(u.character.regeneration, user[1].regeneration);
                u.character.positionX = isCharactersEqual(u.character.positionX, user[1].positionX);
                u.character.positionY = isCharactersEqual(u.character.positionY, user[1].positionY);
                u.character.windRes = isCharactersEqual(u.character.windRes, user[1].windRes);
                u.character.baseHitPoint = isCharactersEqual(u.character.baseHitPoint, user[1].baseHitPoint);
                u.character.hitPoint = isCharactersEqual(u.character.hitPoint, user[1].hitPoint);
                u.character.evasion = isCharactersEqual(u.character.evasion, user[1].evasion);
                u.character.way = isCharactersEqual(u.character.way, user[1].way);
                u.type = isCharactersEqual(u.type, user[2]);
                if (!bool)
                {
                    u.save(function (err)
                    {
                        if (err)
                            return console.error(err);
                    })
                }
            }
        });
    });
};

UsersDAO.prototype.uploadUser = function(ip)
{
    var Users = this.Users;
    Users.findOne({ip: ip}, function(err, u)
    {

    });
};

global.UsersDAO = UsersDAO;
