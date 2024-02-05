import React, { ReactElement } from "react";
import { Oval } from "react-loader-spinner";
import { Button } from "./button";

interface ButtonBoxProps {
  loading: boolean;
  clickFn: () => void;
  h1Text: string;
  h3Text: string;
  spanText: string;
  icon?: ReactElement;
}

const PageBox: React.FC<ButtonBoxProps> = ({
  loading,
  clickFn,
  h1Text,
  h3Text,
  spanText,
  icon,
}) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {loading ? (
        <Oval
          visible={true}
          height="80"
          width="80"
          color="#e7e8e9"
          secondaryColor="#334155"
          ariaLabel="oval-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      ) : (
        <main className="w-screen h-screen flex items-center justify-center">
          <div className="p-4 border border-slate-300 rounded-md shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-bold text-lg">{h1Text}</h1>
                <h3 className="text-sm">{h3Text}</h3>
              </div>
            </div>

            <div className="mt-2 mb-6 h-[1px] w-full bg-slate-300" />
            <Button
              type="button"
              onClick={clickFn}
              className={
                "pt-4 pb-3 rounded-md flex items-center justify-center border border-slate-300 cursor-pointer hover:bg-slate-300 bg-transparent"
              }
            >
              {icon &&
                React.cloneElement(icon, {
                  className: "w-5 h-5 pr-1 text-black",
                })}
              <span className={"text-lg text-black"}>{spanText}</span>
            </Button>
          </div>
        </main>
      )}
    </div>
  );
};

export default PageBox;
