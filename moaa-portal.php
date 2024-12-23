<?php

/*
 * Plugin Name: moaa-portal
 * Description: Plugin to allow MOAA partner page to get results from MOAA google sheets
 */

//** ---------------------------------------- CONSTANTS ---------------------------------------- */

define("MOAA_OPTION_NAME", "moaa_options");
define("BRAND_NAME_META_KEY", "brand_name");
define("USER_META_WORKSHOP_KEY", "workshop");
define("USER_META_KEY_USER_TYPE", "user_type");
define("USER_META_KEY_USER_LINK_ARRAY", "user_link_array");
define("USER_META_KEY_USER_LINK_PORTAL", "portalPage");
define("USER_META_KEY_USER_LINK_ASSESSMENT", "assessmentPage");
define("PORTAL_QUERY_VAR", "brand");
define("CLIENT_ROLE", "subscriber");
define("ADMIN_USER_PROFILE_ROOT_DIV", "admin-user-profile-root");
define("ADMIN_ADD_USER_ROOT_DIV", "admin-add-user-root");
define("ADMIN_MOAA_SETTING_ROOT_DIV", "moaa_setting_page_root");
define("MOAA_PORTAL_PAGE_OPTION_KEY", "portalPage");
define("MOAA_ASSESSMENT_PAGE_OPTION_KEY", "assessmentPage");
define("MOAA_SHEETS_URL_OPTION_KEY", "sheetsUrl");
define("USER_TYPE_WORKSHOP", "workshop");
define("USER_TYPE_PARTNER", "partner");



//** ---------------------------------------- CUSTOM MENU SECTION ---------------------------------------- */


//* https://developer.wordpress.org/news/2024/03/how-to-use-wordpress-react-components-for-plugin-pages/
function moaa_settings_init()
{


  //* options will be an array(portalPage=>string, assessmentPage=>string)
  $default = array(
    MOAA_PORTAL_PAGE_OPTION_KEY => 'portal',
    MOAA_ASSESSMENT_PAGE_OPTION_KEY => 'assessment',
    MOAA_SHEETS_URL_OPTION_KEY => '',
  );

  $schema = array(
    'type' => 'object',
    'properties' => array(
      MOAA_PORTAL_PAGE_OPTION_KEY => array(
        'type' => 'string',
      ),
      MOAA_ASSESSMENT_PAGE_OPTION_KEY => array(
        'type' => 'string',
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
    'MOAA plugin menu title',//string $menu_title,
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

  //TODO: remove
  $options = get_option(MOAA_OPTION_NAME);
  do_action('qm/debug', $options);

  ?>
  <div class="wrap">
    <div id="<?php echo ADMIN_MOAA_SETTING_ROOT_DIV ?>"></div>
  </div>
  <?php
}

add_action('admin_menu', 'moaa_options_page');


function moaa_option_change($option, $old_value, $new_value)
{


  if ($option === MOAA_OPTION_NAME) {
    $user_ids = get_users(args: array('meta_key' => USER_META_KEY_USER_LINK_ARRAY, 'fields' => 'ID'));
    if (count($user_ids) > 0) {
      foreach ($user_ids as $user_id) {
        $user_type = get_user_meta($user_id, USER_META_KEY_USER_TYPE, true);
        $moaa_option = get_option($option);
        set_user_link_meta($user_id, $user_type, $moaa_option);
      }
    }
  }

  //set_user_link_meta($user_id, $user_type, $moaa_option);
}

add_action('updated_option', 'moaa_option_change', 10, 3);
//** ----------------------------------------- REST API SECTION ----------------------------------------- */
/**
 * This is our callback function that embeds our phrase in a WP_REST_Response
 */
function moaa_get_endpoint_phrase()
{
  // rest_ensure_response() wraps the data we want to return into a WP_REST_Response, and ensures it will be properly returned.
  return rest_ensure_response('Hello World, this is the WordPress REST API');
}

/**
 * get sheets data by id passed from react code
 * @param mixed $request
 * @return WP_Error|WP_REST_Response
 */
function moaa_get_sheets_data($request)
{
  do_action('qm/debug', 'api called');
  do_action('qm/debug', $request);
  $current_user_id = get_current_user_id();
  do_action('qm/debug', $current_user_id);
  //TODO: handle id
  //TODO: programmatically handle moaa sheets url
  $options = get_option(MOAA_OPTION_NAME);
  $url_params = $request->get_query_params();
  $id_query_param = '?quiz_id=' . $url_params['id'];
  $moaa_sheets_url = $options[MOAA_SHEETS_URL_OPTION_KEY];
  if ($moaa_sheets_url) {
    $response = wp_remote_get($moaa_sheets_url . $id_query_param);

    //TODO: error handling
    if (is_wp_error($response)) {
      return new WP_Error();
    }

    $body = wp_remote_retrieve_body($response);
    return rest_ensure_response($body);
  } else {
    //TODO: handle error when url empty
    return new WP_Error();
  }
}

function moaa_permission_callback($request)
{
  do_action('qm/debug', 'permission callback called');
  $url_params = $request->get_query_params();
  if ($url_params['id'] && is_user_logged_in()) {
    return true;
  }
  return new WP_Error('rest_forbidden', esc_html__('OMG you can not view private data.', 'my-text-domain'), array('status' => 401));
}

//TODO: consider adding extra field for for portal page link and assessment page link
function get_user_meta_rest_api($user, $field_name)
{
  return array('user_type' => get_user_meta($user['id'], USER_META_KEY_USER_TYPE, true), 'page_url' => get_user_meta($user['id'], USER_META_KEY_USER_LINK_ARRAY, true));
}

/**
 * This function is where we register our routes for our example endpoint.
 */
function moaa_register_example_routes()
{
  register_rest_route('moaa-sheets/v1', '/get', args: array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'moaa_get_sheets_data',
    'permission_callback' => 'moaa_permission_callback'
  ));
  register_rest_field('user', 'user_info', array('get_callback' => 'get_user_meta_rest_api', 'schema' => null));
}

add_action('rest_api_init', 'moaa_register_example_routes');

//** ----------------------------------------- SHORTCODES ----------------------------------------- */
/**
 * Central location to create all shortcodes.
 */
function moaa_shortcodes_init()
{
  add_shortcode('moaa_login_template', 'moaa_login_template_handler');
  add_shortcode('moaa_custom_typeform', 'display_custom_typeform_link');
}

function moaa_login_template_handler()
{
  ob_start();
  ?>
  <form name="loginform" id="loginform" action="<?php echo site_url('wp-login.php') ?>" method="post">
    <p>
      <label for="user_login">Username<br />
        <input type="text" name="log" id="user_login" class="input" value="" size="20"></label>
    </p>
    <p>
      <label for="user_pass">Password<br />
        <input type="password" name="pwd" id="user_pass" class="input" value="" size="20"></label>
    </p>
    <p class="forgetmenot">
      <label for="rememberme"><input name="rememberme" type="checkbox" id="rememberme" value="forever"> Remember
        Me</label>
    </p>
    <p class="submit">
      <input type="submit" name="wp-submit" id="wp-submit" class="button button-primary button-large" value="Log In">
      <input type="hidden" name="redirect_to" value="<?php echo site_url('client-portal') ?>">
    </p>
  </form>
  <?php
  return ob_get_clean();

}

function display_custom_typeform_link()
{
  if (current_user_can('subscriber')) {
    $user_id = get_current_user_id();
    $sheets_id = get_user_meta($user_id, 'sheets-id', true);
    $typeform_url = 'https://tp6k7z890ba.typeform.com/to/kVMmAECp#quiz_id=' . $sheets_id;
    ob_start();
    ?>
    <p>share this typeform link</p>
    <a href="<?php echo $typeform_url ?>"><?php echo $typeform_url ?></a>
    <?php
    return ob_get_clean();
  }
}

add_action('init', 'moaa_shortcodes_init');

//** ----------------------------------------- REGISTRATION/LOGIN ----------------------------------------- */

function moaa_register_extra_fields()
{
  ?>
  <label for="brand-name">brand-name:<br>
    <input type="text" name="brand-name" class="brand-name" value="">
  </label>
  <?php
}

add_action('register_form', 'moaa_register_extra_fields');

function moaa_brand_name_validation($errors, $sanitized_user_login, $user_email)
{

  if (empty($_POST['brand-name'])) {
    $errors->add('brand_name_error', __('brand name is required.', 'textdomain'));
  } else {
    $users = check_if_user_brand_exists($_POST['brand-name']);
    if ($users) {
      $errors->add('brand_name_error', __('brand name is already taken', 'textdomain'));
    }
  }
  return $errors;
}

function check_if_user_brand_exists($meta_value)
{
  $users = get_users(array('meta_value' => $meta_value));
  do_action('qm/debug', $users);
  return $users;
}


add_filter('registration_errors', 'moaa_brand_name_validation', 10, 3);



//! MAY NOT BE NEEDED SINCE ADMIN IS THE ONE THAT REGISTERS
function moaa_user_register($user_id)
{
  if (isset($_POST['brand-name'])) {
    $brandName = sanitize_text_field($_POST['brand-name']);
    update_user_meta($user_id, BRAND_NAME_META_KEY, $brandName);
    // generat UID for sheets-api
    update_user_meta($user_id, 'sheets-id', wp_generate_uuid4());
  }
}

//* handles when new user is registered
/**
 * TODO: handle scenario: 
 * When user register manually through wp-login.php (unlikely route due to risk of spam)
 * when user is registered through admin adding a new user (could be through different hook e.g. edit_user_created_user)
 */
add_action('user_register', 'moaa_user_register');



function moaa_workshop_field()
{
  //* insert react component for adding new user page
  ?>
  <div id="<?php echo ADMIN_ADD_USER_ROOT_DIV ?>"></div>
  <?php
}
//* add custom field when admin add new user
add_action('user_new_form', 'moaa_workshop_field');

//! EVALUATE! MAYBE NOT NEEDED
function moaa_edit_user_profile($profile_user)
{

  //* only admin can check other user and update assigned workshop
  //* input handled by moaa_user_profile_update()
  if (current_user_can('administrator')) {
    //* insert react component when admin edit user
    ?>
    <div id="<?php echo ADMIN_USER_PROFILE_ROOT_DIV ?>"></div>
    <div>Workshop (optional)</div>
    <div>assigned: <?php echo get_user_meta($profile_user->ID, USER_META_WORKSHOP_KEY, true); ?> </div>
    <label for="moaa_workshop">
      <input style="width: auto;" type="text" name="moaa_workshop" id="moaa_workshop" />
    </label>
    <?php
  }
}
//* display additional field when admin edits registered user
add_action('edit_user_profile', 'moaa_edit_user_profile');


/**
 * sets user link meta user_link_array with its value being an array of links for assessment page and portal page
 * @param mixed $user_id
 * @param mixed $user_type
 * @param mixed $moaa_option
 * @return void
 */
function set_user_link_meta($user_id, $user_type, $moaa_option)
{
  $user = get_userdata($user_id);
  do_action('qm/notice', $user);
  if ($user) {
    $query_param = '';
    //TODO: EVALUATE GOOD VALUE TO USE AS QUERY PARAM VALUE
    $identifier_name = urlencode($user->user_nicename);
    if ($user_type === USER_TYPE_WORKSHOP) {
      //** find way to avoid hardcode query param
      $query_param = 'workshop';
    } else if ($user_type === USER_TYPE_PARTNER) {
      $query_param = 'partner';
    }
    $portal_page = add_query_arg($query_param, $identifier_name, home_url('/' . $moaa_option[MOAA_PORTAL_PAGE_OPTION_KEY]));
    $assessment_page = add_query_arg($query_param, $identifier_name, home_url('/' . $moaa_option[MOAA_ASSESSMENT_PAGE_OPTION_KEY]));
    $meta_value = array(MOAA_ASSESSMENT_PAGE_OPTION_KEY => $assessment_page, MOAA_PORTAL_PAGE_OPTION_KEY => $portal_page);

    update_user_meta($user_id, USER_META_KEY_USER_LINK_ARRAY, $meta_value);

  }
}

//* user created when admin add
function moaa_user_created($user_id)
{
  if (!is_wp_error($user_id)) {
    $user_type = $_POST['moaa_user_type'];
    $moaa_option = get_option(MOAA_OPTION_NAME);
    if (isset($user_type)) {
      add_user_meta($user_id, USER_META_KEY_USER_TYPE, sanitize_text_field($user_type));
      if (isset($moaa_option)) {
        set_user_link_meta($user_id, $user_type, $moaa_option);
      }
    }
  }
}
//* user created when admin add
add_action('edit_user_created_user', 'moaa_user_created');



function moaa_user_profile_update($user_id)
{
  if (isset($_POST['moaa_workshop'])) {
    update_user_meta($user_id, USER_META_WORKSHOP_KEY, sanitize_text_field($_POST['moaa_workshop']));
  }
}
//* when admin update user profile
add_action('edit_user_profile_update', 'moaa_user_profile_update');

/** 
 * ! does not seem to work, after register need to check email for password set.
 * ! after setting password, no redirect
 */
//* https://developer.wordpress.org/reference/hooks/registration_redirect/
function moaa_registration_redirect($registration_redirect, $errors)
{
  //* $errors is user id if registration successful, otherwise its an error obj
  if (!is_wp_error($errors)) {
    $brand_name = get_user_meta($errors, BRAND_NAME_META_KEY, true);
    return site_url("clent-portal?brand=" . $brand_name);
  } else {
    return $registration_redirect;
  }
}

add_filter('registration_redirect', 'moaa_registration_redirect', 10, 2);

function moaa_client_login_redirect($redirect_to, $request, $user)
{
  if (!is_wp_error($user) && !current_user_can('administrator')) {
    $user_links = get_user_meta($user->ID, USER_META_KEY_USER_LINK_ARRAY, true)[USER_META_KEY_USER_LINK_PORTAL];
    if (is_array($user_links) && $user->has_cap(CLIENT_ROLE)) {
      $portal_link = $user_links[USER_META_KEY_USER_LINK_PORTAL];
      return $portal_link;
    }
  }
  return $redirect_to;
}

add_filter('login_redirect', 'moaa_client_login_redirect', 10, 3);

//** ----------------------------------------- USER PROFILE ----------------------------------------- */

function moaa_user_profile($profile_user)
{
  ?>
  <div> workshop: <?php echo get_user_meta($profile_user->ID, USER_META_WORKSHOP_KEY, true); ?></div>
  <?php
}
//* display the list of workshop assigned by admin
add_action('show_user_profile', 'moaa_user_profile');

//** ----------------------------------------- OTHER HOOKS/FILTERS ----------------------------------------- */


function moaa_check_page()
{
  $is_client_portal = is_page('client-portal');
  $brand = get_query_var(PORTAL_QUERY_VAR);


  do_action('qm/debug', $is_client_portal);
  do_action('qm/debug', $brand);


}

add_action('wp_head', 'moaa_check_page');

/**
 * Redirects user with brand_name registered if there is no query parameter
 */
function moaa_portal_redirect()
{
  $options = get_option(MOAA_OPTION_NAME);
  $is_portal = is_page($options[MOAA_PORTAL_PAGE_OPTION_KEY]);
  if ($is_portal) {
    if (!is_user_logged_in()) {
      //** redirect if not logged in
      auth_redirect();
    } else {
      $user = wp_get_current_user();
      $user_id = $user->ID;
      $user_links = get_user_meta($user_id, USER_META_KEY_USER_LINK_ARRAY, true);
      if (is_array($user_links)) {

        //TODO: consider programmatically get page name of portal 
        $query_param_workshop = get_query_var('workshop', false);
        $query_param_partner = get_query_var('partner', false);
        $query_param = $query_param_workshop ? $query_param_workshop : $query_param_partner;
        //! user identifier is set to nicename when registered. if registration logic change dont for get to change this
        $user_identifier = $user->user_nicename;

        //* redirect to user's registered brand name
        if (empty($query_param) || $query_param !== $user_identifier) {
          $user_portal_link = $user_links[USER_META_KEY_USER_LINK_PORTAL];
          wp_safe_redirect($user_portal_link);
          exit;
        }
      }
    }
  }
}



add_action('template_redirect', 'moaa_portal_redirect');

function moaa_client_portal_query_vars($qvars)
{
  $qvars[] = 'workshop';
  $qvars[] = 'partner';
  return $qvars;
}

add_filter('query_vars', 'moaa_client_portal_query_vars');

//** ----------------------------------------- SCRIPT QUEUE ----------------------------------------- */
function enqueue_react_scripts()
{
  //TODO: when no query variable, consider where the level of control of not displaying the table
  //* could be done from here by not queueing the script
  //* or from react
  $brand = get_query_var(PORTAL_QUERY_VAR);
  $portal_page = get_option(MOAA_OPTION_NAME)[MOAA_PORTAL_PAGE_OPTION_KEY];

  if (is_admin()) {
    return;
  }

  if (is_page($portal_page) && is_user_logged_in()) {
    $user = wp_get_current_user();

    $asset_file = plugin_dir_path(__FILE__) . 'moaa-react-portal/build/index.asset.php';

    if (!file_exists($asset_file)) {
      return;
    }

    $asset = include $asset_file;

    wp_enqueue_script('moaa_react_portal_script', plugins_url('moaa-react-portal/build/index.js', __FILE__), $asset['dependencies'], $asset['version'], array('in_footer' => true));
    wp_add_inline_script('moaa_react_portal_script', 'const USER = ' . json_encode(array(
      'id' => $user->user_nicename,
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

  wp_enqueue_style('wp-components');
}

add_action('admin_enqueue_scripts', 'moaa_admin_react_scripts');


function moaa_admin_enqueue_styles()
{

}

//** ----------------------------------------- ACTIVATION DEACTIVATION ----------------------------------------- */

function moaa_activate()
{
  // do some init stuff if any
  // Clear the permalinks after the post type has been registered.
  flush_rewrite_rules();
}
function moaa_deactivate()
{
  // Do some unregistering
  wp_dequeue_script('moaa_react_script');
  wp_dequeue_style('moaa_react_styles');
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
  delete_option(MOAA_OPTION_NAME);
}

register_uninstall_hook(
  __FILE__,
  'moaa_uninstall_plugin'
);
