###-begin-{pkgname}-completion-###
function _{pkgname}_completion
  set cmd (commandline -opc)
  set cursor (commandline -C)
  eval env DEBUG=\"" \"" COMP_CWORD=\""$cmd\"" COMP_LINE=\""$cmd"\" COMP_POINT="\"$cursor"\" {completer} completion -- $cmd
end

complete -c {pkgname} -a "(_{pkgname}_completion)"
###-end-{pkgname}-completion-###
