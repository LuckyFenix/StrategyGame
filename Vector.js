/**
 * Created by Robert on 04.05.2015.
 */
function Vector(x, y)
{
    this.X = parseInt(x);
    this.Y = parseInt(y);
    this.sum =  function(v)
    {
        return new Vector(this.X + v.X, this.Y = v.Y);
    };
    this.range = function(v)
    {
        return Math.sqrt(Math.abs(this.X - v.X)*Math.abs(this.X - v.X) + Math.abs(this.Y - v.Y)*Math.abs(this.Y - v.Y));
    }
}

global.Vector = Vector;