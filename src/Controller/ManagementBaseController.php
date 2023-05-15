<?php

namespace KManagement\Controller;

use KLib2\Controller\Controller;

class ManagementBaseController extends Controller 
{

    public function __construct(\KLib2\Interfaces\IPath $p) {
        parent::__construct($p);

        add_action('admin_enqueue_scripts', function() {
            $this->loadAssets();
        });
    } 

    protected function loadAssets(): void 
    {
        wp_enqueue_style(uniqid(), $this->path->url('assets/css/k-management.css'));
        wp_enqueue_script(uniqid(), $this->path->url('assets/js/k-management.js'));
        wp_enqueue_script(uniqid(), $this->path->url('assets/js/user-management.js'));
    }
}