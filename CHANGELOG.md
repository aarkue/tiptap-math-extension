# Changelog

## 1.2.2 (2024-04-09)
### Breaking
- Disable evaluation mode by default

## 1.2.1 (2024-03-27)
### New
- Updated README to include instructions on includidng KaTeX CSS

## 1.2.0 (2024-03-10)
### New
- Added extension options 
  - Allow disabling evaluation mode
  - Update README with options

## 1.1.0 (2023-06-03)
### New
- Display math using the `$$\sum_{i=1}^n x_i$$` notation
- Added Display attribute 
- Allow copy/paste of latex elements directly in the editor
- Indicate with a black border/box if a math element is currently selected
### Fixed
- Updated HTML render function to allow in-editor copy/paste
- Fixed paste handling function to allow pasting LaTeX expressions and automatically converting them to rendered LaTeX elements
- Allow selection of latex nodes

## 1.0.0 (2023-06-02)
Initial version with inline math and basic evaluation support
