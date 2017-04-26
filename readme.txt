=== Shortcake (Shortcode UI) ===
Contributors: fusionengineering, mattheu, danielbachhuber, zebulonj, goldenapples, jitendraharpalani, sanchothefat, bfintal, davisshaver, garyj, mte90, fredserva, khromov, bronsonquick, dashaluna, mehigh, sc0ttkclark, kraftner, pravdomil
Tags: shortcodes
Requires at least: 4.5
Tested up to: 4.7.4
Stable tag: 0.7.2
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Shortcake makes using WordPress shortcodes a piece of cake.

== Description ==

Used alongside `add_shortcode`, Shortcake supplies a user-friendly interface for adding a shortcode to a post, and viewing and editing it from within the content editor.

Once you've installed the plugin, you'll need to [register UI for your shortcodes](https://github.com/wp-shortcake/shortcake/wiki/Registering-Shortcode-UI). For inspiration, check out [examples of Shortcake in the wild](https://github.com/wp-shortcake/shortcake/wiki/Shortcode-UI-Examples).

To report bugs or feature requests, [please use Github issues](https://github.com/wp-shortcake/shortcake/issues).

== Installation ==

Shortcake can be installed like any other WordPress plugin.

Once you've done so, you'll need to [register the UI for your code](https://github.com/wp-shortcake/shortcake/wiki/Registering-Shortcode-UI).

New in 0.4.0 is the ability to [attach javascript functions to event attribute updates](https://github.com/wp-shortcake/shortcake/wiki/Event-Attribute-Callbacks). Action hooks can be used to dynamically show or hide a field based on the value of another, or to implement custom validation rules.

== Frequently Asked Questions ==

= How do I register UI for arbitrary key/value pairs as shortcode attributes? =

Shortcake doesn't support custom key => value pairs as shortcode attributes because it isn't a great user experience.

= After upgrading to Shortcake 0.7.x, some of the shortcode UI fields (post select, user select, etc) don't work as expected. What can I do? =

In version 0.7.0, we updated to the most recent branch of the Select2 library, which provides the enhanced select fields in these field types. This causes a known conflict with plugins that enqueue older versions of Select2. (Popular plugins with known conflicts include WooCommerce and Advanced Custom Fields Pro, among others.)

If you find that you're experiencing conflicts with these plugins, you can set a flag to load select2 in a distinct namespace by defining the constant `SELECT2_NOCONFLICT` in your wp-config.php (or anywhere that's defined before the 'init' hook.)

`
define( 'SELECT2_NOCONFLICT', true );
`

== Running tests ==

We have test coverage for PHP using PHPunit, and JavaScript using Jasmine.

= Running tests locally =

Jasmine tests can be run using `grunt jasmine` and are also run as part of the `grunt scripts` task. To update the core WordPress files used by the Jasmine test suite, run `grunt updateJasmineCoreScripts --abspath="/path/to/wordpress-install"`.

== Screenshots ==

1. Without Shortcake, shortcodes have a minimal UI.
2. But with Shortcake, TinyMCE will render the shortcode in a TinyMCE view.
3. And add a user-friendly UI to edit shortcode content and attributes.
4. Add new shortcodes to your post through "Add Media".

== Upgrade Notice ==

= 0.4.0 =

We've removed the compatibility shim for the `placeholder` attribute argument. You should register a placeholder for your field using the `meta` argument.

= 0.3.0 =

We've removed the compatibility shim for the magical `content` attribute. If you were using this to support editing inner content, you'll need to change your UI registration to use `inner_content`.

== Changelog ==

= 0.7.2 (April 24, 2017) =
* Bug fix: Fix behavior in WordPress 4.7.4 where editing a shortcode would insert a new shortcode into the editor rather than updating the shortcode being edited.
* Bug fix: The replacement used to escape percent (%) characters in attributes only replaced the first appearance
* Bug fix: For select fields with multiple=true, allow multiple options to be selected by default
* Added i18n for all strings in attachment field template
* Added Finnish translation

= 0.7.1 (March 16, 2017) =
* Change shortcode formatting to add a space before the self-closing trailing slash.
* Fix alignment of attachment previews with long filenames.
* Bug fix: Set an initial value on select fields (previously, no value would be set for a select field unless the user interacts with the field).
* Enhancement/fix: Reuse one copy of the media modal and reset its state upon closing, rather than creating duplicate markup each time the modal is accessed.
* Compatability: Uses "full" version of select2.js 4.0.3 to prevent plugin conflicts with other plugins which expect the full version to be enqueued.
* Compatability: Add `SELECT2_NOCONFLICT` flag to load Select2 in a unique namespace to prevent conflicts with other plugins which are loading select2.js version 3.
* Added Norwegian translation.
* Multiple coding style fixes.

= 0.7.0 (November 18, 2016) =
* Adds "Add post element" button to media buttons - one click to open the shortcode list, rather than clicking "Add media" button and then finding "insert post element" in the menu.
* Added "Term Select" field type.
* Added "User Select" field type.
* Added new hooks that fire on rendering/editing/closing a shortcode, which can be used for field types which require custom javascript initialization or cleanup.
* Select fields: add full support for multiple select fields.
* Select fields: support custom ordering of options.
* Select fields: support grouping option in `<optgroup>`s by passing them as a nested array.
* Attachment fields: support multiple selection.
* Attachment fields: support SVG images (if svg uploads are enabled by a plugin or theme).
* Bug fix: Handle percent signs when decoding fields with `encode=true` specified.
* Bug fix: fix issue where it takes two clicks on a shortcode in editor to bring up the Edit Shortcode modal.
* Bug fix: fix issue when searching for shortcodes by name where if multiple shortcodes start with the search string, only the first is returned.
* Bug fix: only output a description field on an attribute if it's not empty.
* Compatability: Remove shims for handling the media modal in WP 4.1 and 4.2.
* Compatability: Upgrade Select2 library to 4.0.3 to avoid conflicts with other plugins which use the latest version of Select2.
* Added Turkish translation.
* Added Finnish translation.
* Added Swedish translation.
* Added Hungarian translation.

= 0.6.2 (November 12, 2015) =
* Bug fix: Listens for "change" event on radio buttons and checkboxes to ensure shortcode attributes are updated.
* Bug fix: Ensures `register_shortcode_ui` is always run before calling get_shortcodes(). Fixes post select AJAX callback when using `register_shortcode_ui` hook.

= 0.6.1 (November 9, 2015) =
* Fixes JavaScript TypeError when clicking media frame menu items.
* Corrects links in readme.

= 0.6.0 (November 2, 2015) =
* Supports an optional `encode=true` argument for attributes, to allow limited HTML support. Attributes need to be run through `shortcode_atts()` in order to be properly decoded.
* Defines a `SHORTCODE_UI_DOING_PREVIEW` constant when rendering a shortcode preview, which enables callbacks to serve a different representation of the shortcode in TinyMCE.
* When an attachment is already selected for a shortcode attribute, opening media library will include it selected.
* Cleaned up icon vertical alignment in the Insert Post Element UI.
* Added CSS utility classes to all field HTML. For instance, the attachment field is now wrapped with `shortcode-ui-field-attachment`.
* Added filters to modify shortcode UI arguments on registration.
* Cleaned up the example plugin, so it's a much more useful developer reference.
* Uses core's JavaScript regex for parsing shortcodes, instead of maintaining separate regex.
* Permits HTML in field labels and descriptions.
* Added Danish translation.
* Added Italian translation.
* Added German translation.
* Core integration: Fully supports PHP 5.2.
* Bug fix: Persists shortcode attributes and inner content when there isn't UI registered for them. Previously, they would be discarded.
* Bug fix: Display the description on the post select field.
* Bug fix: Attribute field change event binds to `input` event rather than `keyup`.
* [Full release notes](http://fusion.net/story/225765/introducing-shortcake-v0-6-0-cream/)

= 0.5.0 (August 26, 2015) =
* Attachment field: Made it easier to change the attachment by clicking on the thumbnail; added attachment metadata in the field view.
* Attachment field: Refactored JavaScript to trigger events.
* Added a `range` input type.
* Introduced a `register_shortcode_ui` hook for plugins to more safely register UI with.
* Removed Preview tab to bring Shortcake's user experience closer to Core, in which the inline visual preview is preferred over a separate preview in the media modal.
* Cleaned up JavaScript using JSHint.
* Added Russian translation.
* Added Portuguese translation.
* Added PHPDoc to all classes.
* Bug fix: Persists `inner_content` for a shortcode even when UI isn't defined.
* Bug fix: Hitting esc in a Shortcake view will now close the modal. (Fixed in Core.)
* Bug fix: Hitting delete when a Shortcake preview is selected in the Visual editor now results in the shortcode being removed. (Fixed in Core.)
* Bug fix: The Shortcake 'search' function no longer visually conflicts with the shortcode grid at small screen sizes. (Fixed in Core.)
* Bug fix: Use `get_post_type()` instead of `get_current_screen()->post_type` so context is properly set on the frontend.
* [Full release notes](http://fusion.net/story/182883/introducing-shortcake-v0-5-0-sugar/)

= 0.4.0 (June 22, 2015) =
* Using [carldanley/wp-js-hooks](https://github.com/carldanley/WP-JS-Hooks) for a basic API to register JS callbacks on shortcode attributes.
* Attachment field uses a loading indicator when the preview for an attachment is loading.
* Added Chinese translation.
* Added French translation.
* Added Spanish translation.
* Bug fix: Prevents fataling when editor is loaded in the frontend context.
* Bug fix: Color field also supports `meta` argument.
* Bug fix: Removes trailing whitespace from shortcodes without attributes.
* Bug fix: Removes double slash in editor css path.
* [Full release notes](http://fusion.net/story/154890/introducing-shortcake-v0-4-0-strawberry/)

= 0.3.0 (April 27, 2015) =
* **Breaking change**: We've removed the compatibility shim for the magical `content` attribute. If you were using this to support editing inner content, you'll need to change your UI registration to use `inner_content`.
* New `post_select` field type for selecting from a list of posts. Supports an additional `query` parameter to modify the search query.
* Using a new `post_type` argument, shortcode UI can be registered for specific post types. This is helpful if you want the UI for a given shortcode to only appear on specific post types.
* For each shortcode attribute, a `meta` argument can be specified to add arbitrary HTML attributes to the field. We've added a compatibility shim for the existing `placeholder` argument. This compatibility shim will be removed in v0.4.
* When inserting a shortcode, UI shows a helpful message when the shortcode doesn't have attributes to configure. Previously, the user was presented with a relatively blank screen.
* Our example plugin can be activated through the WordPress admin.
* Clicking "Insert Post Element" in the left menu effectively acts as back button to selecting a shortcode.
* Language around the editing experience reflects the shortcode you're editing. For instance, with a pullquote shortcode,  "Edit Post Element" becomes "Edit Pullquote".
* Added Dutch translation.
* Source JavaScript files moved to `js/src` for clarity between source and built JavaScript.
* PHP files are scanned using PHP_CodeSniffer.
* Bug fix: Unquoted shortcode attributes are properly supported.
* Bug fix: Attachment field properly registers dependencies.
* Bug fix: "Insert Post Element" experience should work when visual editor is disabled. Shortcake is only loosely coupled with TinyMCE.
* Bug fix: Editor styles are loaded on `after_setup_theme` to prevent fatals.
* [Full release notes](http://fusion.net/story/126834/introducing-shortcake-v0-3-0-butter/).

= 0.2.3 (April 8, 2015) =
* Fix WP 4.1 backwards compatibility issue by restoring arguments passed to TinyMCE view compatibility shim.

= 0.2.2 (April 6, 2015) =
* Update arguments passed to TinyMCE View Render for WP 4.2 compatibility. Previously passed argument wasn't necessary, so removing doesn't break backwards compatibility.

= 0.2.1 (March 18, 2015) =

* Ensure use of jQuery respects jQuery.noConflict() mode in WP.

= 0.2.0 (March 18, 2015) =

* JS abstracted using Browserify.
* Enhancements to "Add Post Element" UI: shortcodes sorted alphabetically; search based on label.
* Much easier to select shortcode previews that include iframes.
* WordPress 4.2 compatibility.
* Added color picker to list of potential fields.
* Bug fix: IE11 compatibility.
* Bug fix: Checkbox field can now be unchecked.
* [Full release notes](http://fusion.net/story/105889/shortcake-v0-2-0-js-abstraction-add-post-element-enhancements-inner-content-field/).

= 0.1.0 (December 23, 2014) =

* Supports all HTML5 input types for form fields.
* Shortcode preview tab within the editing experience.
 }* Re-labeled the UI around “Post Elements”, which is more descriptive than “Content Items.”
* Many bug fixes.
* [Full release notes](http://next.fusion.net/2014/12/23/shortcake-v0-1-0-live-previews-fieldmanager-integration/).

