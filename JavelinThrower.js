/**
 * Created by Robert on 04.05.2015.
 */

function JavelinThrower(name, race, str, agl, vit, defence, movePoints, range, criticalDamageChance, typeOfDamage, regeneration, positionX, positionY, windRes)
{
    this.name = name;
    this.race = race;
    this.str = str;
    this.agl = agl;
    this.vit = vit;
    this.defence = defence;
    this.movePoints = movePoints;
    this.curentMovePoints = this.movePoints;
    this.range = range;
    this.criticalDamageChance = criticalDamageChance;
    this.typeOfDamage = typeOfDamage;
    this.regeneration = regeneration;
    this.positionX = positionX;
    this.positionY = positionY;
    this.windRes = windRes;
    this.baseHitPoint = vit * 10;
    this.hitPoint = this.baseHitPoint;
    this.evasion = (agl / 2) / 100;
}

JavelinThrower.prototype.move_to = function(vector)
{
    if (this.hitPoint == 0)
    {
        return;
    }

    var mas = world.fields.slice();
    if (vector == null)
    {
        if (this.curentMovePoints != 0)
        {
            if (this.way.length <= this.curentMovePoints)
            {
                this.positionX = this.way[this.way.length - 1][0];
                this.positionY = this.way[this.way.length - 1][1];
                this.curentMovePoints = this.curentMovePoints - this.way.length;
                this.way = [];
            } else
            {
                this.positionX = this.way[this.curentMovePoints - 1][0];
                this.positionY = this.way[this.curentMovePoints - 1][1];
                this.way.splice(0, this.movePoints);
                this.curentMovePoints = 0;
            }
        }
        return;
    } else
    {
        this.way = [];
    }
    mas[this.positionX][this.positionY] = 0;

    var marc = function(x, y, k)
    {
        if (x < 0 || x >= world.fields.length || y < 0 || y >= world.fields[0].length)
        {
            return;
        }
        if (mas[x][y] == undefined)
        {
            mas[x][y] = k;
        }
    };

    var a = Date.now();

    var d = 0;
    do
    {
        for (var i = 0; i < world.fields.length; i++)
        {
            for (var j = 0; j < world.fields[0].length; j++)
            {
                if (mas[i][j] == d)
                {
                    marc(i, j-1, d + 1);
                    marc(i-1, j, d + 1);
                    marc(i+1, j, d + 1);
                    marc(i, j+1, d + 1);
                }
            }
        }
        d++;
    } while (mas[vector.X][vector.Y] == undefined);
    var b = Date.now();
    console.log((b - a) / 1000);

    way = [];
    var addWay = function(x, y)
    {
        var min = [x, y];

        if (mas[x-1][y] != undefined && mas[x-1][y] < mas[min[0]][min[1]])
        {
            min = [x - 1, y];
        }
        if (mas[x][y+1] != undefined && mas[x][y+1] < mas[min[0]][min[1]])
        {
            min = [x, y + 1];
        }
        if (mas[x+1][y] != undefined && mas[x+1][y] < mas[min[0]][min[1]])
        {
            min = [x + 1, y];
        }
        if (mas[x][y-1] != undefined && mas[x][y-1] < mas[min[0]][min[1]])
        {
            min = [x, y - 1];
        }

        if (mas[min[0]][min[1]] != 0)
        {
            addWay(min[0], min[1]);
        }
        way.push([x, y]);
    };
    if (vector != null)
    {
        addWay(vector.X, vector.Y);
        this.way = way.slice();
    }
    console.log(this.way);
    if (this.way.length <= this.curentMovePoints)
    {
        this.positionX = this.way[this.way.length - 1][0];
        this.positionY = this.way[this.way.length - 1][1];
        this.curentMovePoints -= this.way.length;
        this.way = [];
    } else
    {
        this.positionX = this.way[this.curentMovePoints - 1][0];
        this.positionY = this.way[this.curentMovePoints - 1][1];
        this.way.splice(0, this.movePoints);
        this.curentMovePoints = 0;
    }
};

JavelinThrower.prototype.fight = function(object)
{
    if ((new Vector(this.positionX, this.positionY)).range(new Vector(object.positionX, object.positionY)) > this.range)
    {
        return;
    }
    if (this.hitPoint == 0)
    {
        return;
    }
    var damage = this.str;
    if (Math.random() <= (this.criticalDamageChance + this.agl / 1000))
    {
        damage = damage * 2;
    }
    damage = (damage - object.defence) <= 0 ? 1 : damage - object.defence;
    if (Math.random() <= (object.evasion) && this.typeOfDamage == 'physical')
    {
        damage = 0;
    }
    damage = damage > object.hitPoint ? object.hitPoint : damage;
    object.hitPoint = (object.hitPoint - damage);
};

JavelinThrower.prototype.regen = function()
{
    if (this.hitPoint == 0)
    {
        return;
    }
    this.hitPoint = this.hitPoint + this.regeneration <= this.baseHitPoint
        ? this.hitPoint + this.regeneration
        : this.baseHitPoint;
};

JavelinThrower.prototype.end = function()
{
    this.regen();
    this.curentMovePoints = this.movePoints;
};

global.JavelinThrower = JavelinThrower;