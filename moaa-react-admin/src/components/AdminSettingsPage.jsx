import apiFetch from "@wordpress/api-fetch";
import { SelectControl, Button, NoticeList } from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { store as noticesStore } from "@wordpress/notices";
import { useDispatch, useSelect } from "@wordpress/data";

export default function AdminSettingPage() {
  const [pages, portalPage, setPortalPage, saveSettings] = useSettings();

  return (
    <>
      <SelectControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        label="Portal Page"
        value={portalPage}
        options={pages}
        onChange={(value) => setPortalPage(value)}
      />
      <Notices />
      <Button variant="primary" onClick={saveSettings} __next40pxDefaultSize>
        Save
      </Button>
    </>
  );
}

const useSettings = () => {
  const { createSuccessNotice } = useDispatch(noticesStore);
  const [portalPage, setPortalPage] = useState();
  const [pagesOptions, setPages] = useState([]);

  //** apiFetch handles nonces for auth
  useEffect(() => {
    apiFetch({ path: "/wp/v2/settings" }).then((settings) => {
      console.log(settings);
      setPortalPage(settings.moaa_options.portalPage);
    });
    apiFetch({ path: "/wp/v2/pages" }).then((pages) => {
      pages.forEach((page) => {
        const slug = page.slug;
        setPages((prev) => [{ label: slug, value: slug }, ...prev]);
      });
    });
  }, []);

  const saveSettings = () => {
    apiFetch({
      path: "/wp/v2/settings",
      method: "POST",
      data: {
        moaa_options: { portalPage },
      },
    }).then(() => {
      createSuccessNotice("Settings Saved");
    });
  };

  return [pagesOptions, portalPage, setPortalPage, saveSettings];
};

const Notices = () => {
  const { removeNotice } = useDispatch(noticesStore);
  const notices = useSelect((select) => select(noticesStore).getNotices());

  if (notices.length === 0) {
    return null;
  }

  return <NoticeList notices={notices} onRemove={removeNotice} />;
};
