# Notes

## Packages to be installed

- `nano`
- `git`
- `fakeroot`
- `binutils`
- `make`
- `xorg-fonts-misc`
- `gcc`
- `virtualbox-guest-utils` when in virtualbox

### yay

- `arc-gotham-gtk-theme-git arc-gtk-theme-git arc-icon-theme-git` - dark openbox theme

## X server

### Openbox setup

- install `openbox`, `xorg-server` `xorg-xinit`, `sddm` (SDDM is a display manager; used by KDE for example) and `picom`
- add `picom -b` and `exec openbox-session` at the end of `/etc/X11/xinit/xinitrc.d/50-systemd-user.sh`
- create `.picom.conf` (rounded corners will be added soon, hopefully)
- start `sddm`

```sh
sudo pacman -Sy openbox xorg-xinit xorg-server picom
echo "fading = true;\ninactive-opacity = 0.9;\ncorner-radius=5;\nblur-method=\"box\";\nblur-size=12" > ~/.picom.conf
echo "picom -b --experimental-backends --config ~/.picom.conf" >> /etc/X11/xinit/.xinitrc
echo "exec openbox-session" >> /etc/X11/xinit/.xinitrc
sudo systemctl start sddm
sudo systemctl enable sddm
```

## Openbox config

`.config/openbox/rc.xml`

```xml
<?xml version="1.0"?>
<openbox_config xmlns="http://openbox.org/3.4/rc" xmlns:xi="http://www.w3.org/2001/XInclude">
  <theme>
    <name>Arc-Dark</name>
    <titleLayout>NLIMC</titleLayout>
    <keepBorder>yes</keepBorder>
    <animateIconify>yes</animateIconify>
    <font place="ActiveWindow">
      <name>Sans</name>
      <size>12</size>
      <weight>Normal</weight>
      <slant>Normal</slant>
    </font>
    <font place="InactiveWindow">
      <name>Sans</name>
      <size>11</size>
      <weight>Normal</weight>
      <slant>Normal</slant>
    </font>
    <font place="MenuHeader">
      <name>Sans</name>
      <size>11</size>
      <weight>Normal</weight>
      <slant>Normal</slant>
    </font>
    <font place="MenuItem">
      <name>Sans</name>
      <size>11</size>
      <weight>Normal</weight>
      <slant>Normal</slant>
    </font>
    <font place="ActiveOnScreenDisplay">
      <name>Sans</name>
      <size>11</size>
      <weight>Normal</weight>
      <slant>Normal</slant>
    </font>
    <font place="InactiveOnScreenDisplay">
      <name>Sans</name>
      <size>11</size>
      <weight>Normal</weight>
      <slant>Normal</slant>
    </font>
  </theme>
</openbox_config>
```