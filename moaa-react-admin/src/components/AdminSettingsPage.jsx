import apiFetch from "@wordpress/api-fetch";
import {
  Panel,
  PanelBody,
  PanelRow,
  SelectControl,
  Button,
  NoticeList,
} from "@wordpress/components";
import { useEffect, useState } from "@wordpress/element";
import { store as noticesStore } from "@wordpress/notices";
import { useDispatch, useSelect } from "@wordpress/data";

export default function AdminSettingPage() {
  const [
    pages,
    portalPage,
    setPortalPage,
    assessmentPage,
    setAssessmentPage,
    users,
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
          <SelectControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            label="Select Assessment Page"
            value={assessmentPage}
            options={pages}
            onChange={(value) => setAssessmentPage(value)}
          />
        </PanelBody>
        {users?.workshop ? <WorkshopsList workshops={users.workshop} /> : null}
        {users?.partner ? <PartnersList partners={users.partner} /> : null}
      </Panel>

      <Button variant="primary" onClick={saveSettings} __next40pxDefaultSize>
        Save
      </Button>
      <Notices />
    </>
  );
}

const WorkshopsList = ({ workshops }) => {
  return (
    <PanelBody title="Workshops">
      {workshops.map((workshop) => {
        return <div key={workshop.name}>{workshop.name}</div>;
      })}
    </PanelBody>
  );
};

const PartnersList = ({ partners }) => {
  return (
    <PanelBody title="Partners">
      {partners.map((partner) => {
        return <div key={partner.name}>{partner.name}</div>;
      })}
    </PanelBody>
  );
};

const useSettings = () => {
  const { createSuccessNotice } = useDispatch(noticesStore);
  const [portalPage, setPortalPage] = useState();
  const [assessmentPage, setAssessmentPage] = useState();
  const [pagesOptions, setPages] = useState([]);
  const [users, setUsers] = useState({ workshop: [], partner: [] });

  //** apiFetch handles nonces for auth
  useEffect(() => {
    apiFetch({ path: "/wp/v2/settings" }).then((settings) => {
      console.log(settings);
      setPortalPage(settings.moaa_options.portalPage);
      setAssessmentPage(settings.moaa_options.assessmentPage);
    });
    apiFetch({ path: "/wp/v2/pages?_fields=slug" }).then((pages) => {
      console.log(pages);
      pages.forEach((page) => {
        const slug = page.slug;
        setPages((prev) => [{ label: slug, value: slug }, ...prev]);
      });
    });
    //* add field for other important fields like portal/assessment link
    apiFetch({ path: "/wp/v2/users?_fields=user_type,name" }).then((users) => {
      console.log(users);
      users.forEach((user) => {
        //* user_type field registered by moaa plugin code
        //* user_type is set on adminAddUser
        const userType = user.user_type;
        if (userType) {
          setUsers((prev) => ({
            //TODO: add portal link and assessment link
            ...prev,
            [userType]: [...prev[userType], { name: user.name }],
          }));
        }
      });
    });
  }, []);

  const saveSettings = () => {
    apiFetch({
      path: "/wp/v2/settings",
      method: "POST",
      data: {
        moaa_options: { portalPage, assessmentPage },
      },
    }).then(() => {
      createSuccessNotice("Settings Saved");
    });
  };

  return [
    pagesOptions,
    portalPage,
    setPortalPage,
    assessmentPage,
    setAssessmentPage,
    users,
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
