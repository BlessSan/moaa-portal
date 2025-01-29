import apiFetch from "@wordpress/api-fetch";
import {
  Panel,
  PanelBody,
  SelectControl,
  Button,
  NoticeList,
  TextControl,
  Tip,
} from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { store as noticesStore } from "@wordpress/notices";
import { useDispatch, useSelect } from "@wordpress/data";
import { CopyToClipboard } from "react-copy-to-clipboard";

const DisplayShortCodeTip = () => {
  const [isCopied, setIsCopied] = useState(false);

  const shortcodeName = USER.shortcode_name;

  return (
    <Tip>
      To display the data, please insert this shortcode inside a container into
      the selected page: <b>[{shortcodeName}]</b>{" "}
      <CopyToClipboard
        text={`[${shortcodeName}]`}
        onCopy={() => setIsCopied(true)}
      >
        <Button size="compact" variant="secondary">
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </CopyToClipboard>
    </Tip>
  );
};

export default function AdminSettingPage() {
  const [
    pages,
    portalPage,
    setPortalPage,
    clientPage,
    setClientPage,
    sheetsUrl,
    setSheetsUrl,
    saveSettings,
  ] = useSettings();

  return (
    <div style={{ boxSizing: "border-box" }}>
      <Panel header="MOAA Portal Settings Page">
        <PanelBody title="Page select">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <SelectControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label="Select Workshop Portal Page"
              value={portalPage}
              options={pages}
              onChange={(value) => setPortalPage(value)}
            />
            <SelectControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label="Select Client Portal Page"
              value={clientPage}
              options={pages}
              onChange={(value) => setClientPage(value)}
            />
            <DisplayShortCodeTip />
            <TextControl
              __nextHasNoMarginBottom
              __next40pxDefaultSize
              label="Sheets url"
              onChange={(value) => setSheetsUrl(value)}
              value={sheetsUrl}
            />
          </div>
        </PanelBody>
      </Panel>
      <Button
        variant="primary"
        onClick={saveSettings}
        __next40pxDefaultSize
        style={{ marginTop: "10px" }}
      >
        Save
      </Button>
      <Notices />
    </div>
  );
}

const useSettings = () => {
  const { createSuccessNotice } = useDispatch(noticesStore);
  const [portalPage, setPortalPage] = useState();
  const [clientPage, setClientPage] = useState();
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [pagesOptions, setPages] = useState([]);

  const saveSettings = () => {
    apiFetch({
      path: "/wp/v2/settings",
      method: "POST",
      data: {
        moaa_options: { portalPage, clientPage, sheetsUrl },
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
      setClientPage(settings.moaa_options.clientPage);
      setSheetsUrl(settings.moaa_options.sheetsUrl);
    });
    apiFetch({ path: "/wp/v2/pages?_fields=slug&per_page=100" }).then(
      (pages) => {
        console.log(pages);
        pages.forEach((page) => {
          const slug = page.slug;
          setPages((prev) => [{ label: slug, value: slug }, ...prev]);
        });
      }
    );
  }, []);

  return [
    pagesOptions,
    portalPage,
    setPortalPage,
    clientPage,
    setClientPage,
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
