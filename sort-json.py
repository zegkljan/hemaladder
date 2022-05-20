import json
import locale
import sys
from typing import Any, List, Mapping, OrderedDict


def parse_sort_key(raw: str) -> List[str]:
  return raw.split('.')


def get_sort_key(sort_key: List[str], value: Any):
  if value is None:
    return ''
  if len(sort_key) == 0:
    return locale.strxfrm(value)
  curr_key = sort_key[0]
  if curr_key in value:
    return get_sort_key(sort_key[1:], value[curr_key])
  return ''


def sort_json_object(json_string: str, sort_keys: List[List[str]]) -> Mapping:
  obj: OrderedDict = json.loads(json_string, object_pairs_hook=OrderedDict)
  pairs = list(obj.items())
  for sort_key in reversed(sort_keys):
    pairs.sort(key=lambda x: get_sort_key(sort_key, x[1]) if sort_key else x[0])
  return OrderedDict(pairs)


def main():
  locale.setlocale(locale.LC_COLLATE, '')

  if len(sys.argv) < 2:
    raise ValueError('Too few arguments.')
  if len(sys.argv) > 2:
    sort_keys: List[List[str]] = []
    for sort_key_raw in sys.argv[2:]:
      sort_keys.append(parse_sort_key(sort_key_raw))

  fn = sys.argv[1]
  with open(fn, 'r') as f:
    json_str: str = f.read()

  sorted_map = sort_json_object(json_str, sort_keys)
  with open(fn, 'w') as f:
    json.dump(sorted_map, f, indent=2, ensure_ascii=False)


if __name__ == '__main__':
  main()
