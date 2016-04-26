###-begin-bower-completion-###
function _bower_completion
  set cmd (commandline -opc)
  set cursor (commandline -C)
  echo $cmd > /tmp/debug.log
  echo $cursor>> /tmp/debug.log
  set completions (eval env DEBUG=\""tabtab*\"" COMP_CWORD=\""$cmd\"" COMP_LINE=\""$cmd\"" COMP_POINT=\""$cursor\"" bower-complete completion --json)

  for completion in $completions
    set cmd "node -pe \"'$completion'.split(':').join('\n')\""
    set parts (eval $cmd)
    complete -f -c bower -a "'$parts[1]'" -d "$parts[2]"
    echo $parts[1]
  end
end

complete -d 'tabtab' -c bower -a "(eval _bower_completion)"
###-end-bower-completion-###
