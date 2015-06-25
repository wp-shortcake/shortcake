=== Shortcake (Shortcode UI) ===
Contributors: fusionengineering, mattheu, danielbachhuber, zebulonj, goldenapples, jitendraharpalani, sanchothefat, bfintal, davisshaver
Tags: shortcodes
Requires at least: 4.1
Tested up to: 4.2.1
Stable tag: 0.4.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Shortcake makes using WordPress shortcodes a piece of cake.

== Description ==

Used alongside `add_shortcode`, Shortcake supplies a user-friendly interface for adding a shortcode to a post, and viewing and editing it from within the content editor.

Once you've installed the plugin, you'll need to [register UI for your shortcodes](https://github.com/fusioneng/Shortcake/wiki/Registering-Shortcode-UI). For inspiration, check out [examples of Shortcake in the wild](https://github.com/fusioneng/Shortcake/wiki/Shortcode-UI-Examples).

To report bugs or feature requests, [please use Github issues](https://github.com/fusioneng/Shortcake/issues).

== Installation ==

Shortcake can be installed like any other WordPress plugin.

Once you've done so, you'll need to [register the UI for your code](https://github.com/fusioneng/Shortcake/wiki/Registering-Shortcode-UI).

New in 0.4.0 is the ability to [attach javascript functions to event attribute updates](https://github.com/fusioneng/Shortcake/wiki/Event-Attribute-Callbacks). Action hooks can be used to dynamically show or hide a field based on the value of another, or to implement custom validation rules.

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
* Re-labeled the UI around “Post Elements”, which is more descriptive than “Content Items.”
* Many bug fixes.
* [Full release notes](http://next.fusion.net/2014/12/23/shortcake-v0-1-0-live-previews-fieldmanager-integration/).

