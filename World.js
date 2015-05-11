/**
 * Created by Robert on 07.05.2015.
 */
require('./Vector');

function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var World = function(w, h)
{
    this.wind =
    {
        vector : new Vector(0, 0),
        speed : 0
    };
    this.fields = [w];
    for (var i = 0; i < w; i++)
    {
        this.fields[i] = new Array(h);
    }
    for (i = 0; i < 1000; i++)
    {
        this.fields[getRandomInt(0, this.fields.length - 1)][getRandomInt(0, this.fields[0].length - 1)] = 'x';
    }
};

global.World = World;