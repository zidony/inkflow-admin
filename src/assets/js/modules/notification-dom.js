export function syncNotificationDateGroups(list) {
  list.querySelectorAll('.ink-notif-date-group').forEach(group => {
    let cursor = group.nextElementSibling;
    let hasVisibleRows = false;

    while (cursor && !cursor.classList.contains('ink-notif-date-group')) {
      if (cursor.classList.contains('ink-notif-row') && !cursor.classList.contains('d-none')) {
        hasVisibleRows = true;
        break;
      }
      cursor = cursor.nextElementSibling;
    }

    group.classList.toggle('d-none', !hasVisibleRows);
  });
}
