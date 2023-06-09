<?php

namespace KManagement\Controller;

use KLib2\Interfaces\IPath;
use Timber\Timber;

class ManagementController extends ManagementBaseController
{

    public function __construct(IPath $p)
    {
        parent::__construct($p);
    }

    /**
     * @action add_action
     * @hook admin_menu
     * @priority 10
     * @args 1
     */
    public function managerDashboard(): void
    {

        add_menu_page(
            'Gestion planning', // Titre de la page
            'Gestion planning', // Nom du menu
            'manage_options', // Capacité requise pour voir le menu
            'gestion-planing', // Slug de la page
            [$this, 'initManagement'], // Fonction de rappel pour afficher le contenu de la page
            'dashicons-calendar' // Icône de calendrier
        );
    }

    public function initManagement() 
    {
        ob_start();

        $data = Timber::render($this->path->dir('templates/management/manager.html'), [
            'username' => $this->getCurrentUsername(),
            'post_count' => $this->getCurrentUserPostCount(),
            'user' => get_current_user_id(),
            'user_data' => json_encode(wp_get_current_user(), JSON_PRETTY_PRINT),
            'user_list' =>  json_encode($this->getAdmins(), JSON_PRETTY_PRINT),
            'admin_url' => \admin_url('admin-ajax.php'),
            'manager_ids' => [28, 46]
        ]);

        ob_end_clean();

        echo $data;
    }


    /**
     * @action add_action
     * @hook wp_ajax_nopriv_management_save_week
     * @priority 10
     * @args 1
     */
    public function saveAdminWeek()
    {
        echo $this->_saveWeek();

        die();
    }

     /**
     * @action add_action
     * @hook wp_ajax_nopriv_management_done_week
     * @priority 10
     * @args 1
     */
    public function saveAdminDoneWeek()
    {
        $this->_saveDone();
        die();
    }

    /**
     * @action add_action
     * @hook wp_ajax_management_done_week
     * @priority 10
     * @args 1
     */
    public function saveDoneWeek()
    {
        $this->_saveDone();
        die();
    }

    private function _saveDone() 
    {

        $data = json_decode($this->_getWeekArray(), true);

        $data['dones'] = $this->post('dones');

        $d = \json_encode($data, \JSON_PRETTY_PRINT);

        \update_option($data['year'] . '-' . $data['week'] . '-' . $data['user'], $d);

        return $d;
    }


    /**
     * @action add_action
     * @hook wp_ajax_management_save_week
     * @priority 10
     * @args 1
     */
    public function saveWeek()
    {
        echo $this->_saveWeek();
        die();
    }


    /**
     * @action add_action
     * @hook wp_ajax_nopriv_management_get_week
     * @priority 10
     * @args 1
     */
    public function getAdminWeek()
    {
        echo json_decode($this->_getWeekData());
        die();
    }


    /**
     * @action add_action
     * @hook wp_ajax_management_get_week
     * @priority 10
     * @args 1
     */
    public function getWeek()
    {
        echo $this->_getWeekData();
        die();
    }

        /**
     * @action add_action
     * @hook wp_ajax_nopriv_management_get_user_week
     * @priority 10
     * @args 1
     */
    public function getAdminUserWeek()
    {
        echo json_decode($this->_getWeekData());
        die();
    }


    /**
     * @action add_action
     * @hook wp_ajax_management_get_user_week
     * @priority 10
     * @args 1
     */
    public function getUserWeek()
    {
        echo $this->_getWeekData();
        die();
    }

    private function _saveWeek()
    {
        $data = $this->post();

        $y = $data['year'];
        $w = $data['week'];
        $u = $data['user'];

        $d = \json_encode($data, \JSON_PRETTY_PRINT);

        \update_option($y . '-' . $w . '-' . $u, $d);

        return $d;
    }

    private function _getWeekData()
    {
        return json_encode(
            json_decode($this->_getWeekArray()),
            JSON_PRETTY_PRINT
        );
    }

    private function _getWeekArray()
    {
        return get_option($this->post('year') . '-' . $this->post('week') . '-' . $this->post('user'));
    }

    private function getCurrentUsername(): string
    {
        return \wp_get_current_user()->display_name;
    }

    private function getAdmins(): array
    {
        return get_users(array('role' => 'administrator'));
    }

    private function getCurrentUserPostCount(): int
    {
        // Récupérer l'utilisateur courant
        $current_user = wp_get_current_user();

        // Définir les arguments de la requête
        $args = array(
            'author'         => $current_user->ID,
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'date_query'     => array(
                array(
                    'year'   => date('Y'),
                    'week'   => date('W'),
                    'compare' => '=',
                ),
            ),
        );

        // Effectuer la requête
        $query = new \WP_Query($args);

        // Initialiser le compteur
        $post_count = 0;

        // Parcourir les résultats de la requête
        if ($query->have_posts()) {
            while ($query->have_posts()) {

                $query->the_post();

                // Vérifier si l'article est un édito
                if (has_category('edito', get_the_ID()) ||  has_category('jdx', get_the_ID())) {
                    $post_count += 2;
                } else {
                    $post_count += 1;
                }
            }
        }

        // Réinitialiser la requête
        wp_reset_postdata();

        return $post_count;
    }

}
