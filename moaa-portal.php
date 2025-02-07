<?php
defined('ABSPATH') or exit;

/*
 * Plugin Name: moaa-portal
 * Description: Plugin to allow MOAA partner page to get results from MOAA google sheets
 */

//** ---------------------------------------- CONSTANTS ---------------------------------------- */

define("MOAA_OPTION_NAME", "moaa_options");
define("MOAA_BRAND_NAME_META_KEY", "brand_name");
define("MOAA_USER_META_WORKSHOP_KEY", "workshop");
define("MOAA_USER_META_KEY_USER_TYPE", "user_type");
define("MOAA_USER_META_KEY_USER_LINK_ARRAY", "user_link_array");
define("MOAA_USER_META_KEY_USER_LINK_PORTAL", "portalPage");
define("MOAA_USER_META_KEY_USER_LINK_ASSESSMENT", "assessmentPage");
define("MOAA_PORTAL_QUERY_VAR", "brand");
define("MOAA_CLIENT_ROLE", "subscriber");
define("MOAA_ADMIN_USER_PROFILE_ROOT_DIV", "admin-user-profile-root");
define("MOAA_ADMIN_ADD_USER_ROOT_DIV", "admin-add-user-root");
define("MOAA_ADMIN_SETTING_ROOT_DIV", "moaa_setting_page_root");
define("MOAA_WORKSHOP_PORTAL_PAGE_OPTION_KEY", "portalPage");
define("MOAA_CLIENT_PORTAL_PAGE_OPTION_KEY", "clientPage");
define("MOAA_ASSESSMENT_PAGE_OPTION_KEY", "assessmentPage");
define("MOAA_SHEETS_URL_OPTION_KEY", "sheetsUrl");
define("MOAA_USER_TYPE_WORKSHOP", "workshop");
define("MOAA_USER_TYPE_PARTNER", "partner");
define('MOAA_PORTAL_REACT_ROOT_ID', "moaa-portal-react-root");
define('MOAA_PARTNER_PORTAL_REACT_ROOT_ID', "moaa-partner-portal-react-root");
define('MOAA_WORKSHOP_PORTAL_SHORTCODE_NAME', 'moaa_workshop_portal');
define('MOAA_PARTNER_PORTAL_SHORTCODE_NAME', 'moaa_partner_portal');



//** ---------------------------------------- CUSTOM MENU SECTION ---------------------------------------- */


//* https://developer.wordpress.org/news/2024/03/how-to-use-wordpress-react-components-for-plugin-pages/
function moaa_settings_init()
{

  $page = get_pages(array('number' => 1));
  $defaultPageOption = "";
  if ($page) {
    $defaultPageOption = $page[0]->post_name;
  }

  //* options will be an array(portalPage=>string, assessmentPage=>string)
  $default = array(
    MOAA_WORKSHOP_PORTAL_PAGE_OPTION_KEY => $defaultPageOption,
    MOAA_CLIENT_PORTAL_PAGE_OPTION_KEY => $defaultPageOption,
    MOAA_SHEETS_URL_OPTION_KEY => '',
  );

  $schema = array(
    'type' => 'object',
    'properties' => array(
      MOAA_WORKSHOP_PORTAL_PAGE_OPTION_KEY => array(
        'type' => 'string',
      ),
      MOAA_CLIENT_PORTAL_PAGE_OPTION_KEY => array(
        'type' => 'string'
      ),
      MOAA_SHEETS_URL_OPTION_KEY => array(
        'type' => 'string'
      )
    ),
  );


  register_setting(
    'options',
    MOAA_OPTION_NAME,
    array(
      'type' => 'object',
      'default' => $default,
      'show_in_rest' => array(
        'schema' => $schema
      )
    )
  );
}

add_action('init', 'moaa_settings_init');

function moaa_options_page()
{
  add_submenu_page(
    'tools.php',//string $parent_slug,
    'MOAA plugin page title', //string $page_title,
    'MOAA plugin settings',//string $menu_title,
    'manage_options',//string $capability,
    'moaa-plugin',//string $menu_slug,
    'moaa_options_page_html'//callable $function = ''
  );
}

function moaa_options_page_html()
{
  // check user capabilities
  if (!current_user_can('manage_options')) {
    return;
  }

  ?>
  <div class="wrap">
    <div id="<?php echo MOAA_ADMIN_SETTING_ROOT_DIV ?>"></div>
  </div>
  <?php
}

add_action('admin_menu', 'moaa_options_page');

//** ----------------------------------------- REST API SECTION ----------------------------------------- */
/**
 * get sheets data by id passed from react code
 * @param mixed $request
 * @return WP_Error|WP_REST_Response
 */
function moaa_get_sheets_data($request)
{
  //TODO: handle id
  //TODO: programmatically handle moaa sheets url
  $options = get_option(MOAA_OPTION_NAME);
  $url_params = $request->get_query_params();
  $action_name = 'getWorkshopResults';
  //TODO: may need to handle client portal (or maybe different endpoint entirely)
  $workshop_id = $url_params['workshop_id'];
  $id_query_param = '?action=' . $action_name . '&workshop_id=' . $url_params['workshop_id'];
  $moaa_sheets_url = $options[MOAA_SHEETS_URL_OPTION_KEY];

  $transient_name = 'moaa_sheets_workshop_data_' . $workshop_id;
  if ($moaa_sheets_url) {
    $moaa_sheets_workshop_data = get_transient($transient_name);
    if ($moaa_sheets_workshop_data === false) {
      $response = wp_remote_get($moaa_sheets_url . $id_query_param, array('timeout' => 10.0));

      if (is_wp_error($response)) {
        return rest_ensure_response($response);
      }

      $body = wp_remote_retrieve_body($response);
      set_transient($transient_name, $body, 10);
      return rest_ensure_response(get_transient($transient_name));
    } else {
      return rest_ensure_response($moaa_sheets_workshop_data);
    }
  } else {
    $error = new WP_Error('moaa_missing_sheets_url', esc_html__('moaa google sheets url missing or not set by admin'), array('status' => 500));
    return rest_ensure_response($error);
  }
}

function moaa_get_workshops_list($request)
{
  $options = get_option(MOAA_OPTION_NAME);
  $moaa_sheets_url = $options[MOAA_SHEETS_URL_OPTION_KEY];
  if ($moaa_sheets_url) {

    $moaa_sheets_workshop_list = get_transient('moaa_sheets_workshop_list');
    if ($moaa_sheets_workshop_list === false) {

      $response = wp_remote_get($moaa_sheets_url . '?action=getWorkshops');

      if (is_wp_error($response)) {
        return rest_ensure_response($response);
      }

      $body = wp_remote_retrieve_body($response);
      set_transient('moaa_sheets_workshop_list', $body, 5);
      return rest_ensure_response(get_transient('moaa_sheets_workshop_list'));
    } else {
      return rest_ensure_response($moaa_sheets_workshop_list);
    }
  } else {
    $error = new WP_Error('moaa_missing_sheets_url', esc_html__('moaa google sheets url missing or not set by admin'), array('status' => 500));
    return rest_ensure_response($error);
  }
}

function moaa_get_partners_list($request)
{
  $options = get_option(MOAA_OPTION_NAME);
  $moaa_sheets_url = $options[MOAA_SHEETS_URL_OPTION_KEY];
  if ($moaa_sheets_url) {

    $moaa_sheets_partner_list = get_transient('moaa_sheets_partner_list');
    if ($moaa_sheets_partner_list === false) {

      $response = wp_remote_get($moaa_sheets_url . '?action=getPartners');

      if (is_wp_error($response)) {
        return rest_ensure_response($response);
      }

      $body = wp_remote_retrieve_body($response);
      set_transient('moaa_sheets_partner_list', $body, 5);
      return rest_ensure_response(get_transient('moaa_sheets_partner_list'));
    } else {
      return rest_ensure_response($moaa_sheets_partner_list);
    }
  } else {
    $error = new WP_Error('moaa_missing_sheets_url', esc_html__('moaa google sheets url missing or not set by admin'), array('status' => 500));
    return rest_ensure_response($error);
  }
}

function moaa_permission_callback($request)
{
  if (is_user_logged_in()) {
    return true;
  }
  return new WP_Error('rest_forbidden', esc_html__('Not authorized', 'my-text-domain'), array('status' => 401));
}

/**
 * This function is where we register our routes for our example endpoint.
 */
function moaa_register_sheets_routes()
{
  register_rest_route('moaa-sheets/v1', '/getWorkshopResults', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'moaa_get_sheets_data'
  ));
  register_rest_route('moaa-sheets/v1', '/getWorkshopResultsPartner', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'moaa_get_sheets_data',
    'permission_callback' => 'moaa_permission_callback'
  ));
  register_rest_route('moaa-sheets/v1', '/getWorkshopsList', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'moaa_get_workshops_list'
  ));
  register_rest_route('moaa-sheets/v1', '/getPartnersList', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'moaa_get_partners_list'
  ));
}

add_action('rest_api_init', 'moaa_register_sheets_routes');

//** ----------------------------------------- SHORTCODES ----------------------------------------- */
/**
 * Central location to create all shortcodes.
 */
function moaa_shortcodes_init()
{
  add_shortcode(MOAA_WORKSHOP_PORTAL_SHORTCODE_NAME, 'moaa_workshop_portal_react_root');
  add_shortcode(MOAA_PARTNER_PORTAL_SHORTCODE_NAME, 'moaa_partner_portal_react_root');
}


function moaa_workshop_portal_react_root()
{
  ob_start();
  ?>
  <div id="<?php echo MOAA_PORTAL_REACT_ROOT_ID ?>"></div>
  <?php
  return ob_get_clean();
}

function moaa_partner_portal_react_root()
{
  if (is_user_logged_in()) {
    $user = wp_get_current_user();
    $id = $user->ID;
    if (current_user_can(MOAA_USER_TYPE_PARTNER) || current_user_can('administrator')) {
      ob_start();
      ?>
      <div id="<?php echo MOAA_PARTNER_PORTAL_REACT_ROOT_ID ?>"></div>
      <?php
      return ob_get_clean();
    } else {
      ob_start();
      ?>
      <p> Forbidden, user type is not Partner </p>
      <?php
      return ob_get_clean();
    }

  }
}


add_action('init', 'moaa_shortcodes_init');

//** ----------------------------------------- REGISTRATION/LOGIN ----------------------------------------- */

//** ----------------------------------------- USER PROFILE ----------------------------------------- */

function moaa_add_partner_role_to_dropdown($roles)
{
  $partner_role = get_role(MOAA_USER_TYPE_PARTNER);

  if ($partner_role) {
    $roles[MOAA_USER_TYPE_PARTNER] = array('name' => __('Partner'), 'capabilities' => $partner_role->capabilities);
  }
  return $roles;
}

add_filter('editable_roles', 'moaa_add_partner_role_to_dropdown');

//** ----------------------------------------- OTHER HOOKS/FILTERS ----------------------------------------- */

/**
 * Redirects user with brand_name registered if there is no query parameter
 */
function moaa_portal_redirect()
{
  $options = get_option(MOAA_OPTION_NAME);
  $portal_page = $options[MOAA_CLIENT_PORTAL_PAGE_OPTION_KEY];
  $is_client_portal = is_page($portal_page);
  if ($is_client_portal) {
    if (!is_user_logged_in()) {
      //** redirect if not logged in
      auth_redirect();
    } else {
      $query_param = get_query_var('id');
      $user = wp_get_current_user();
      if (current_user_can(MOAA_USER_TYPE_PARTNER)) {
        //! user identifier is set to username when registered. if registration logic change don't for get to change this
        $user_identifier = $user->user_login;

        //* redirect to user's registered brand name
        if (empty($query_param) || $query_param !== $user_identifier) {
          $portal_url = home_url('/' . $portal_page);
          $client_url = add_query_arg('id', $user_identifier, $portal_url);
          wp_safe_redirect($client_url);
          exit;
        }
      }
    }
  }
}

add_action('template_redirect', 'moaa_portal_redirect');


function moaa_login_redirect($redirect_to, $request, $user)
{
  $option = get_option(MOAA_OPTION_NAME);
  if ($user && in_array(MOAA_USER_TYPE_PARTNER, $user->roles) && isset($option)) {
    $portal_page = $option[MOAA_CLIENT_PORTAL_PAGE_OPTION_KEY];
    $portal_url = home_url('/' . $portal_page);
    $client_portal_url = add_query_arg('id', $user->user_login, $portal_url);
    return $client_portal_url;
  }
  return $redirect_to;
}

add_filter('login_redirect', 'moaa_login_redirect', 10, 3);

function moaa_client_portal_query_vars($qvars)
{
  $qvars[] = 'workshop';
  $qvars[] = 'partner';
  $qvars[] = 'id';
  return $qvars;
}

add_filter('query_vars', 'moaa_client_portal_query_vars');

//** ----------------------------------------- SCRIPT QUEUE ----------------------------------------- */
function enqueue_react_scripts()
{
  //TODO: when no query variable, consider where the level of control of not displaying the table
  //* could be done from here by not queueing the script
  //* or from react
  $portal_page = get_option(MOAA_OPTION_NAME)[MOAA_WORKSHOP_PORTAL_PAGE_OPTION_KEY];
  $partner_page = get_option(MOAA_OPTION_NAME)[MOAA_CLIENT_PORTAL_PAGE_OPTION_KEY];


  if (is_page($portal_page) || is_page($partner_page)) {

    $asset_file = plugin_dir_path(__FILE__) . 'moaa-react-portal/build/index.asset.php';

    if (!file_exists($asset_file)) {
      return;
    }

    $asset = include $asset_file;

    wp_enqueue_script('moaa_react_portal_script', plugins_url('moaa-react-portal/build/index.js', __FILE__), $asset['dependencies'], $asset['version'], array('in_footer' => true));
    wp_add_inline_script('moaa_react_portal_script', 'const USER = ' . json_encode(array(
      'react_root_id' => MOAA_PORTAL_REACT_ROOT_ID,
      'react_partner_root_id' => MOAA_PARTNER_PORTAL_REACT_ROOT_ID,
      'portal_type' => is_page($partner_page) ? 'partner' : 'workshop',
      'rest_base_url' => get_rest_url(null, 'moaa-sheets/v1'),
      'nonce' => wp_create_nonce('wp_rest')
    )), 'before');
  }

}

add_action('wp_enqueue_scripts', 'enqueue_react_scripts');


/**
 ** enqueue react scripts configured by wp-scripts
 * https://developer.wordpress.org/news/2024/03/how-to-use-wordpress-react-components-for-plugin-pages/
 * https://developer.wordpress.org/block-editor/getting-started/devenv/get-started-with-wp-scripts/
 */
function moaa_admin_react_scripts()
{
  if (!is_admin()) {
    return;
  }

  $asset_file = plugin_dir_path(__FILE__) . 'moaa-react-admin/build/index.asset.php';

  if (!file_exists($asset_file)) {
    return;
  }

  $asset = include $asset_file;

  wp_enqueue_script('moaa_admin_react_script', plugins_url('moaa-react-admin/build/index.js', __FILE__), $asset['dependencies'], $asset['version'], array('in_footer' => true));
  wp_add_inline_script('moaa_admin_react_script', 'const USER = ' . json_encode(array(
    'shortcode_name' => MOAA_WORKSHOP_PORTAL_SHORTCODE_NAME,
    'partner_shortcode_name' => MOAA_PARTNER_PORTAL_SHORTCODE_NAME,
  )), 'before');

  wp_enqueue_style('wp-components');
}

add_action('admin_enqueue_scripts', 'moaa_admin_react_scripts');


function moaa_admin_enqueue_styles()
{

}

//** ----------------------------------------- ACTIVATION DEACTIVATION ----------------------------------------- */

function moaa_activate()
{
  if (!current_user_can('activate_plugins'))
    return;
  $plugin = isset($_REQUEST['plugin']) ? $_REQUEST['plugin'] : '';
  check_admin_referer("activate-plugin_{$plugin}");
  // do some init stuff if any
  if (!get_role(MOAA_USER_TYPE_PARTNER)) {
    add_role(MOAA_USER_TYPE_PARTNER, __('Partner'), array('read' => true));
  }

  // Clear the permalinks after the post type has been registered.
  flush_rewrite_rules();
}
function moaa_deactivate()
{
  if (!current_user_can('activate_plugins'))
    return;
  $plugin = isset($_REQUEST['plugin']) ? $_REQUEST['plugin'] : '';
  check_admin_referer("deactivate-plugin_{$plugin}");
  // Do some unregistering
  wp_dequeue_script('moaa_react_portal_script');
  //wp_dequeue_style('moaa_react_portal_styles');
  wp_dequeue_script('moaa_admin_react_script');
  //wp_dequeue_style('moaa_admin_react_styles');
  // Clear the permalinks to remove our post type's rules from the database.
  flush_rewrite_rules();
}

register_activation_hook(
  __FILE__,
  'moaa_activate'
);

register_deactivation_hook(
  __FILE__,
  'moaa_deactivate'
);

//** ----------------------------------------- UNINSTALL METHODS ----------------------------------------- */


function moaa_uninstall_plugin()
{
  if (!current_user_can('activate_plugins'))
    return;
  check_admin_referer('bulk-plugins');

  // Important: Check if the file is the one
  // that was registered during the uninstall hook.
  if (__FILE__ != WP_UNINSTALL_PLUGIN)
    return;
  delete_option(MOAA_OPTION_NAME);
}

register_uninstall_hook(
  __FILE__,
  'moaa_uninstall_plugin'
);
