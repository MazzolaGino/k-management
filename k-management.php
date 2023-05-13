<?php
/**
 * Plugin Name: k-management
 * Description: k-management
 * Version: 0.0.1
 * Author: 
 * Author URI: 
 */

require_once(plugin_dir_path(__FILE__) . 'vendor/autoload.php');

if(!class_exists("KLib2\Core\Plugin")) {
    require_once(plugin_dir_path(__FILE__) . '../k-module2/vendor/autoload.php'); 
}


use KLib2\Core\Plugin;
use KManagement\Path;

 /** Chargment du plugin */
 $kreview_plugin = new Plugin(new Path());
 $kreview_plugin->load();
 