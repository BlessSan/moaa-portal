import apiFetch from "@wordpress/api-fetch";
import {
  Panel,
  PanelBody,
  SelectControl,
  Button,
  NoticeList,
  TextControl,
} from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { store as noticesStore } from "@wordpress/notices";
import { useDispatch, useSelect } from "@wordpress/data";

export default function AdminSettingPage() {
  const [
    pages,
    portalPage,
    setPortalPage,
    sheetsUrl,
    setSheetsUrl,
    saveSettings,
  ] = useSettings();

  return (
    <>
      <Panel header="MOAA Portal Settings Page">
        <PanelBody title="Page select">
          <SelectControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            label="Select Portal Page"
            value={portalPage}
            options={pages}
            onChange={(value) => setPortalPage(value)}
          />
          <TextControl
            __nextHasNoMarginBottom
            __next40pxDefaultSize
            label="Sheets url"
            onChange={(value) => setSheetsUrl(value)}
            value={sheetsUrl}
          />
        </PanelBody>
      </Panel>

      <Button variant="primary" onClick={saveSettings} __next40pxDefaultSize>
        Save
      </Button>
      <Notices />
    </>
  );
}

const useSettings = () => {
  const { createSuccessNotice } = useDispatch(noticesStore);
  const [portalPage, setPortalPage] = useState();
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [pagesOptions, setPages] = useState([]);

  const saveSettings = () => {
    apiFetch({
      path: "/wp/v2/settings",
      method: "POST",
      data: {
        moaa_options: { portalPage, sheetsUrl },
      },
    }).then(() => {
      createSuccessNotice("Settings Saved");
    });
  };

  //** apiFetch handles nonces for auth
  useEffect(() => {
    apiFetch({ path: "/wp/v2/settings" }).then((settings) => {
      console.log(settings);
      setPortalPage(settings.moaa_options.portalPage);
      setSheetsUrl(settings.moaa_options.sheetsUrl);
    });
    apiFetch({ path: "/wp/v2/pages?_fields=slug" }).then((pages) => {
      console.log(pages);
      pages.forEach((page) => {
        const slug = page.slug;
        setPages((prev) => [{ label: slug, value: slug }, ...prev]);
      });
    });
  }, []);

  return [
    pagesOptions,
    portalPage,
    setPortalPage,
    sheetsUrl,
    setSheetsUrl,
    saveSettings,
  ];
};

const Notices = () => {
  const { removeNotice } = useDispatch(noticesStore);
  const notices = useSelect((select) => select(noticesStore).getNotices());

  if (notices.length === 0) {
    return null;
  }

  return <NoticeList notices={notices} onRemove={removeNotice} />;
};
