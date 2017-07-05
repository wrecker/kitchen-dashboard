<?php

//// FIRST , ESTABLISH CURRENT PHASE OF MOON C WHERE -1 <= C < 1 ... (0 => 100% FULL MOON, +1 and -1 => New Moon)

// moon phase is 29 days, 12 hours, 44 mins, 2.8 secs
$current_phase_interval = (29 * 24*60*60) + (12 * 60*60) + (44 * 60) + 2.8;
$phase_start=time()-mktime(4, 15, 2, 1, 1, 2014); // time of a known new moon 

$current_phase=($phase_start-$current_phase_interval*intval($phase_start/$current_phase_interval))/$current_phase_interval; // phase from 0 to 1

$current_phase=isset($_GET['phase']) ? $_GET['phase'] : (2*($current_phase-0.5));// -1 <= $current_phase < 1

//// NOW, IMPORT IMAGE OF MOON AND COLOUR IN SHADED AREA

// First import the image of the moon
$dimensions = getimagesize('/var/www/moon.png');
$size = $dimensions[0]; // Lets assume width = height as moon is a perfect circle

$moon = imagecreatefrompng('/var/www/moon.png');
// To maintain transparency
imageAlphaBlending($moon, true);
imageSaveAlpha($moon, true);

// alpha channel for background
imagefill($moon, 0, 0, imagecolorallocatealpha($moon, 0, 0, 0, 127));

// Slightly transparent black for shaded portion of moon (Hex 0 0 0, transparency: 25/127 (about 20% transparent))
$shaded_area_colour = imagecolorallocatealpha($moon, 0, 0, 0, 35);

// 6 shades of gray for boundary between light and dark (black lines with slight transparency)
// (No obvious way of drawing an alpha gradiant with GD??)
$boundary_colour_1 = imagecolorallocatealpha($moon, 0, 0, 0, 40); 
$boundary_colour_2 = imagecolorallocatealpha($moon, 0, 0, 0, 55); 
$boundary_colour_3 = imagecolorallocatealpha($moon, 0, 0, 0, 70); 
$boundary_colour_4 = imagecolorallocatealpha($moon, 0, 0, 0, 85); 
$boundary_colour_5 = imagecolorallocatealpha($moon, 0, 0, 0, 100); 
$boundary_colour_6 = imagecolorallocatealpha($moon, 0, 0, 0, 115); 

// Radius of moon (half the size of image)
$radius = $size/2;
$pi = pi();

// Always draw a full moon if we are within 5% of one
if(abs($current_phase) > 0.05)
{
    // For all points from y=0 to y=$radius (top of moon to center)
    for($y=0; $y<2*$radius; $y++)
    {
        // calc horizontal width of moon at each point $y:
        // equation of circle: r^2 = x^2 + y^2    (for convenience we're pretending moons center is at point (0,0) (its actually (radius,radius)))
        // So, half the moons width (distance to (+/-)$x  from x=0 @ y=$y) at point x = squareroot(r^2 - y^2)
        $x = round(sqrt($radius*$radius - $y*$y));
    
        $moon_x_width = 2*$x; // (Total width from left to right side at y=$y:)
    
        // Multiply current phase by cur_circle_width to get width of the shaded portion
        // (Subtract 3 px because we want to use the 6 boundary colours across the boundary line)
        $shaded_portion_width = $moon_x_width * abs($current_phase) - 3; // abs makes current phase positive
        $unshaded_portion_width = $moon_x_width * (1-abs($current_phase));

        // Since our imaginary circle is calculted at midpoint (0,0) we must correct each coord by +$radius
        $X = $x+$radius;
        $Y = $y+$radius;

        // Only looping from y=0 to y=radius so to complete bottom half we must mirror each line in the bottom half of the image
        // (this minimises calls to sqrt which could get expensive for larger images)
        $Y_mirror = $size-$Y;

        // Shade from right side inwards by default (Full Moon, Waning Gibbous, Last Quarter, Waning Crescent)
        // But if phase is between -1 and 0, we want to shade from the leftside inwards (New Moon, 
        // Waxing Crescent,First Quarter, Waxing Gibbous)
        if($current_phase < 0) 
        {
            // Subtract unshaded portion from x coord to move shade to the left side of moon
            $X -= $unshaded_portion_width;
        }

        // Draw a horizontal line over the current shaded portion, to make it dark
        imageline($moon, $X-$shaded_portion_width, $Y, $X, $Y, $shaded_area_colour);    


        // (For images with an odd number of pixels in height, it ends up trying to shade 
        // the very middle line twice - so this check prevents that happening)
        if($Y_mirror != $Y) 
            imageline($moon, $X-$shaded_portion_width, $Y_mirror, $X, $Y_mirror, $shaded_area_colour);

        // Shading right side of moon, add gradiant to left side of shade
        if($current_phase > 0) 
        {
            for($i=1;$i<=6;$i++)
            {
                $boundary_colour_var_name = "boundary_colour_$i";
                imagesetpixel($moon, $X-$shaded_portion_width-$i, $Y, $$boundary_colour_var_name);
                // And again, mirror in y access
                imagesetpixel($moon, $X-$shaded_portion_width-$i, $Y_mirror, $$boundary_colour_var_name);
            }
        }    
        else // Shading left side of moon, add gradiant to right side of shade
        {
            for($i=6;$i>=1;$i--)
            {
                $boundary_colour_var_name = "boundary_colour_$i";
                imagesetpixel($moon, $X+$i, $Y, $$boundary_colour_var_name);
                // And again, mirror in y access
                imagesetpixel($moon, $X+$i, $Y_mirror, $$boundary_colour_var_name);
            }
        }
    }    
}


// Print info about current moon phase (unless we want it hidden)
if(isset($_GET['show_info']) && $_GET['show_info'] != 1)
{
    $moon_type = 'Waxing blah blah';
    imagestring ($moon , 1 , 10 , 10 , "Moon type:".$moon_type."\nDate ".date('Y-m-d H:i:s').'\nLocation: ' , imagecolorallocate($moon,255,255,255));
}

// Set the file content type to png and print img binary
header("Content-Type: image/png");
imagepng($moon);
imagedestroy($moon);
?>
