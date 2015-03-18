=== Shortcake (Shortcode UI) ===
Contributors: mattheu, danielbachhuber, jitendraharpalani, sanchothefat, bfintal, davisshaver
Tags: shortcodes
Requires at least: 4.1
Tested up to: 4.2
Stable tag: 0.2.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Shortcake makes using WordPress shortcodes a piece of cake.

== Description ==

Used alongside `add_shortcode`, Shortcake supplies a user-friendly interface for adding a shortcode to a post, and viewing and editing it from within the content editor.

See the [Github README](https://github.com/fusioneng/Shortcake/blob/master/README.md) for implementation notes. To report bugs or feature requests, [please use Github issues](https://github.com/fusioneng/Shortcake/issues).

== Installation ==

Shortcake can be installed like any other WordPress plugin. Once you've done so, [follow these integration steps](https://github.com/fusioneng/Shortcake#usage) to register UI for your shortcode.

== Screenshots ==

1. Without Shortcake, shortcodes have a minimal UI.
2. But with Shortcake, TinyMCE will render the shortcode in a TinyMCE view.
3. And add a user-friendly UI to edit shortcode content and attributes.
4. Add new shortcodes to your post through "Add Media".

== Changelog ==

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

