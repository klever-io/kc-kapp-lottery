import React, { ReactElement } from "react";
import { Oval } from "react-loader-spinner";
import { Button } from "./button";

interface ButtonBoxProps {
  loading: boolean;
  clickFn: () => void;
  spanTxt: string;
  icon?: ReactElement;
}

const ButtonBox: React.FC<ButtonBoxProps> = ({
  loading,
  clickFn,
  spanTxt,
  icon,
}) => {
  return (
    <div
      className="grid grid-cols-1 gap-2"
    >
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
        <Button
          type="button"
          onClick={clickFn}
          className={
            "pt-4 pb-3 rounded-md flex items-center justify-center border border-slate-300 cursor-pointer hover:bg-slate-300 bg-transparent"
          }
        >
          {icon &&
            React.cloneElement(icon, { className: "w-5 h-5 pr-1 text-black" })}
          <span className={"text-lg text-black"}>{spanTxt}</span>
        </Button>
      )}
    </div>
  );
};

export default ButtonBox;
