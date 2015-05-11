/**
 * Created by Robert on 05.05.2015.
 */
require('./garapko_les9');

function Berserker(name, race, str, agl, vit, defence, moveSpeed, range, criticalDamageChance, typeOfDamage, regeneration, positionX, positionY, windRes)
{
    JavelinThrower.apply(this, arguments);
}

function inherit_A(Child, Parent)
{
    var F = function () { };
    F.prototype = Parent.prototype;

    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.super = Parent.prototype;
}

inherit_A(Berserker, JavelinThrower);

Berserker.prototype.fight = function(object)
{
    JavelinThrower.prototype.fight.apply(this, arguments);
    JavelinThrower.prototype.fight.apply(this, arguments);
};

global.Berserker = Berserker;