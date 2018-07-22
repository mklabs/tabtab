###-begin-{pkgname}-completion-###
function _{pkgname}_completion
  set cmd (commandline -o)
  set cursor (commandline -C)
  set words (node -pe "'$cmd'.split(' ').length")

  set completions (eval env DEBUG=\"" \"" COMP_CWORD=\""$words\"" COMP_LINE=\""$cmd \"" COMP_POINT=\""$cursor\"" {completer} completion -- $cmd)

  for completion in $completions
    echo -e $completion
  end
end

complete -f -d '{pkgname}' -c {pkgname} -a "(eval _{pkgname}_completion)"
###-end-{pkgname}-completion-###
