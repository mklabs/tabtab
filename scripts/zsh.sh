###-begin-yo-completion-###
_yo_completion () {
  local cword line point words reply
  read -Ac words
  read -cn cword
  let cword-=1
  read -l line
  read -ln point

  local si=$IFS
  IFS=$'\n' reply=($(COMP_CWORD="$cword" COMP_LINE="$line" COMP_POINT="$point" yo-complete completion -- "${words[@]}"))
  IFS=$si
  _describe 'values' reply
}

compdef _yo_completion yo
###-end-yo-completion-###
